package com.contest.coding.service.impl;

import com.contest.coding.dto.contest.ContestRequest;
import com.contest.coding.dto.contest.ContestResponse;
import com.contest.coding.entity.Contest;
import com.contest.coding.exception.BadRequestException;
import com.contest.coding.exception.ResourceNotFoundException;
import com.contest.coding.repository.ContestRepository;
import com.contest.coding.service.ContestService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ContestServiceImpl implements ContestService {

    private final ContestRepository contestRepository;

    public ContestServiceImpl(ContestRepository contestRepository) {
        this.contestRepository = contestRepository;
    }

    @Override
    @Transactional
    public ContestResponse createContest(ContestRequest request) {
        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        String status = determineStatus(request.getStartTime(), request.getEndTime());

        Contest contest = Contest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(status)
                .build();

        Contest savedContest = contestRepository.save(contest);
        return mapToResponse(savedContest);
    }

    @Override
    @Transactional
    public ContestResponse updateContest(Long id, ContestRequest request) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));

        if (request.getStartTime().isAfter(request.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        String status = determineStatus(request.getStartTime(), request.getEndTime());

        contest.setTitle(request.getTitle());
        contest.setDescription(request.getDescription());
        contest.setStartTime(request.getStartTime());
        contest.setEndTime(request.getEndTime());
        contest.setStatus(status);

        Contest updatedContest = contestRepository.save(contest);
        return mapToResponse(updatedContest);
    }

    @Override
    @Transactional
    public void deleteContest(Long id) {
        if (!contestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contest not found with id: " + id);
        }
        contestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ContestResponse getContestDetails(Long id) {
        Contest contest = contestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + id));
        // Refresh status dynamically before returning
        contest.setStatus(determineStatus(contest.getStartTime(), contest.getEndTime()));
        return mapToResponse(contest);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContestResponse> getAllContests() {
        return contestRepository.findAll().stream()
                .map(contest -> {
                    contest.setStatus(determineStatus(contest.getStartTime(), contest.getEndTime()));
                    return mapToResponse(contest);
                })
                .collect(Collectors.toList());
    }

    private String determineStatus(LocalDateTime startTime, LocalDateTime endTime) {
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(startTime)) {
            return "UPCOMING";
        } else if (now.isAfter(endTime)) {
            return "COMPLETED";
        } else {
            return "ACTIVE";
        }
    }

    private ContestResponse mapToResponse(Contest contest) {
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .startTime(contest.getStartTime())
                .endTime(contest.getEndTime())
                .status(contest.getStatus())
                .build();
    }
}
