package com.contest.coding.service.impl;

import com.contest.coding.dto.leaderboard.LeaderboardEntryResponse;
import com.contest.coding.dto.leaderboard.LeaderboardResponse;
import com.contest.coding.entity.Contest;
import com.contest.coding.entity.Question;
import com.contest.coding.entity.Submission;
import com.contest.coding.entity.SubmissionStatus;
import com.contest.coding.entity.User;
import com.contest.coding.exception.ResourceNotFoundException;
import com.contest.coding.repository.ContestRepository;
import com.contest.coding.repository.SubmissionRepository;
import com.contest.coding.service.LeaderboardService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class LeaderboardServiceImpl implements LeaderboardService {

    private final ContestRepository contestRepository;
    private final SubmissionRepository submissionRepository;

    public LeaderboardServiceImpl(ContestRepository contestRepository, SubmissionRepository submissionRepository) {
        this.contestRepository = contestRepository;
        this.submissionRepository = submissionRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public LeaderboardResponse getContestLeaderboard(Long contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + contestId));

        List<Submission> submissions = submissionRepository.findByQuestionContestId(contestId);

        // Group submissions by User
        Map<User, List<Submission>> userSubmissionsMap = submissions.stream()
                .collect(Collectors.groupingBy(Submission::getUser));

        List<LeaderboardEntryResponse> entries = new ArrayList<>();

        for (Map.Entry<User, List<Submission>> entry : userSubmissionsMap.entrySet()) {
            User user = entry.getKey();
            List<Submission> userSubs = entry.getValue();

            // Filter accepted submissions
            List<Submission> acceptedSubs = userSubs.stream()
                    .filter(s -> s.getStatus() == SubmissionStatus.ACCEPTED)
                    .collect(Collectors.toList());

            // Group accepted submissions by Question to avoid duplicate points for the same question
            Map<Question, List<Submission>> acceptedByQuestion = acceptedSubs.stream()
                    .collect(Collectors.groupingBy(Submission::getQuestion));

            int totalScore = 0;
            int solvedCount = acceptedByQuestion.size();
            long totalTimeMinutes = 0;

            for (Map.Entry<Question, List<Submission>> qEntry : acceptedByQuestion.entrySet()) {
                Question question = qEntry.getKey();
                List<Submission> qAcceptedSubs = qEntry.getValue();

                // Find the first accepted submission for this question
                Submission firstAccepted = qAcceptedSubs.stream()
                        .min(Comparator.comparing(Submission::getSubmittedAt))
                        .orElseThrow();

                // Calculate elapsed minutes from contest start
                long elapsedMinutes = 0;
                if (firstAccepted.getSubmittedAt().isAfter(contest.getStartTime())) {
                    elapsedMinutes = Duration.between(contest.getStartTime(), firstAccepted.getSubmittedAt()).toMinutes();
                }

                totalScore += question.getPoints();
                totalTimeMinutes += elapsedMinutes;
            }

            entries.add(LeaderboardEntryResponse.builder()
                    .userId(user.getId())
                    .userName(user.getName())
                    .totalScore(totalScore)
                    .solvedCount(solvedCount)
                    .submissionTimeMinutes(totalTimeMinutes)
                    .build());
        }

        // Sort entries:
        // 1. Total Score descending
        // 2. Solved Count descending
        // 3. Total Time ascending
        entries.sort((a, b) -> {
            if (!a.getTotalScore().equals(b.getTotalScore())) {
                return b.getTotalScore().compareTo(a.getTotalScore());
            }
            if (!a.getSolvedCount().equals(b.getSolvedCount())) {
                return b.getSolvedCount().compareTo(a.getSolvedCount());
            }
            return a.getSubmissionTimeMinutes().compareTo(b.getSubmissionTimeMinutes());
        });

        // Assign Rank (Standard Competition Ranking, e.g., 1, 2, 2, 4)
        int currentRank = 1;
        int count = 0;
        LeaderboardEntryResponse prev = null;

        for (LeaderboardEntryResponse entry : entries) {
            count++;
            if (prev != null) {
                boolean isTie = entry.getTotalScore().equals(prev.getTotalScore())
                        && entry.getSolvedCount().equals(prev.getSolvedCount())
                        && entry.getSubmissionTimeMinutes().equals(prev.getSubmissionTimeMinutes());
                if (!isTie) {
                    currentRank = count;
                }
            }
            entry.setRank(currentRank);
            prev = entry;
        }

        return LeaderboardResponse.builder()
                .contestId(contest.getId())
                .contestTitle(contest.getTitle())
                .entries(entries)
                .build();
    }
}
