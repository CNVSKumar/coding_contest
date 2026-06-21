package com.contest.coding.service.impl;

import com.contest.coding.dto.submission.SubmissionRequest;
import com.contest.coding.dto.submission.SubmissionResponse;
import com.contest.coding.entity.*;
import com.contest.coding.exception.BadRequestException;
import com.contest.coding.exception.ResourceNotFoundException;
import com.contest.coding.repository.QuestionRepository;
import com.contest.coding.repository.SubmissionRepository;
import com.contest.coding.repository.TestCaseRepository;
import com.contest.coding.repository.UserRepository;
import com.contest.coding.service.CodeExecutionService;
import com.contest.coding.service.ExecutionResult;
import com.contest.coding.service.SubmissionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final TestCaseRepository testCaseRepository;
    private final CodeExecutionService codeExecutionService;

    public SubmissionServiceImpl(SubmissionRepository submissionRepository,
                                 UserRepository userRepository,
                                 QuestionRepository questionRepository,
                                 TestCaseRepository testCaseRepository,
                                 CodeExecutionService codeExecutionService) {
        this.submissionRepository = submissionRepository;
        this.userRepository = userRepository;
        this.questionRepository = questionRepository;
        this.testCaseRepository = testCaseRepository;
        this.codeExecutionService = codeExecutionService;
    }

    @Override
    @Transactional
    public SubmissionResponse submitSolution(SubmissionRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        Contest contest = question.getContest();
        LocalDateTime now = LocalDateTime.now();

        // Validate contest status
        if (now.isBefore(contest.getStartTime())) {
            throw new BadRequestException("Contest has not started yet. Submissions are disabled.");
        }
        if (now.isAfter(contest.getEndTime())) {
            throw new BadRequestException("Contest has ended. Submissions are closed.");
        }

        List<TestCase> testCases = testCaseRepository.findByQuestionId(question.getId());

        SubmissionStatus finalStatus = SubmissionStatus.ACCEPTED;
        Integer finalScore = question.getPoints();
        long maxExecutionTimeMs = 0;
        String errorMessage = null;

        if (testCases.isEmpty()) {
            // No test cases defined, default to accepted with full score
            finalStatus = SubmissionStatus.ACCEPTED;
            finalScore = question.getPoints();
        } else {
            for (TestCase tc : testCases) {
                // Execute code against test case (timeout is set to 5 seconds)
                ExecutionResult execResult = codeExecutionService.execute(
                        request.getSourceCode(),
                        request.getLanguage(),
                        tc.getInputData(),
                        tc.getExpectedOutput(),
                        5000L
                );

                maxExecutionTimeMs = Math.max(maxExecutionTimeMs, execResult.getExecutionTimeMs());

                if (execResult.getStatus() != SubmissionStatus.ACCEPTED) {
                    finalStatus = execResult.getStatus();
                    finalScore = 0;
                    errorMessage = execResult.getErrorMessage();
                    break; // stop on first failing test case
                }
            }
        }

        Submission submission = Submission.builder()
                .sourceCode(request.getSourceCode())
                .language(request.getLanguage())
                .status(finalStatus)
                .score(finalScore)
                .user(user)
                .question(question)
                .executionTimeMs(maxExecutionTimeMs)
                .errorMessage(errorMessage)
                .build();

        Submission savedSubmission = submissionRepository.save(submission);
        return mapToResponse(savedSubmission);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionStatus(Long id) {
        Submission submission = submissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + id));
        return mapToResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getUserSubmissionHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + userEmail));
        return submissionRepository.findByUserIdOrderBySubmittedAtDesc(user.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getAllSubmissions() {
        return submissionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private SubmissionResponse mapToResponse(Submission submission) {
        return SubmissionResponse.builder()
                .id(submission.getId())
                .sourceCode(submission.getSourceCode())
                .language(submission.getLanguage())
                .status(submission.getStatus().name())
                .score(submission.getScore())
                .submittedAt(submission.getSubmittedAt())
                .userId(submission.getUser().getId())
                .userName(submission.getUser().getName())
                .questionId(submission.getQuestion().getId())
                .questionTitle(submission.getQuestion().getTitle())
                .executionTimeMs(submission.getExecutionTimeMs())
                .errorMessage(submission.getErrorMessage())
                .build();
    }
}
