package com.contest.coding.service.impl;

import com.contest.coding.dto.question.QuestionRequest;
import com.contest.coding.dto.question.QuestionResponse;
import com.contest.coding.entity.Contest;
import com.contest.coding.entity.Question;
import com.contest.coding.exception.ResourceNotFoundException;
import com.contest.coding.repository.ContestRepository;
import com.contest.coding.repository.QuestionRepository;
import com.contest.coding.service.QuestionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class QuestionServiceImpl implements QuestionService {

    private final QuestionRepository questionRepository;
    private final ContestRepository contestRepository;

    public QuestionServiceImpl(QuestionRepository questionRepository, ContestRepository contestRepository) {
        this.questionRepository = questionRepository;
        this.contestRepository = contestRepository;
    }

    @Override
    @Transactional
    public QuestionResponse createQuestion(Long contestId, QuestionRequest request) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest not found with id: " + contestId));

        Question question = Question.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .inputFormat(request.getInputFormat())
                .outputFormat(request.getOutputFormat())
                .constraints(request.getConstraints())
                .points(request.getPoints())
                .contest(contest)
                .build();

        Question savedQuestion = questionRepository.save(question);
        return mapToResponse(savedQuestion);
    }

    @Override
    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));

        question.setTitle(request.getTitle());
        question.setDescription(request.getDescription());
        question.setInputFormat(request.getInputFormat());
        question.setOutputFormat(request.getOutputFormat());
        question.setConstraints(request.getConstraints());
        question.setPoints(request.getPoints());

        Question updatedQuestion = questionRepository.save(question);
        return mapToResponse(updatedQuestion);
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Question not found with id: " + id);
        }
        questionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByContest(Long contestId) {
        if (!contestRepository.existsById(contestId)) {
            throw new ResourceNotFoundException("Contest not found with id: " + contestId);
        }
        return questionRepository.findByContestId(contestId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public QuestionResponse getQuestionDetails(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + id));
        return mapToResponse(question);
    }

    private QuestionResponse mapToResponse(Question question) {
        return QuestionResponse.builder()
                .id(question.getId())
                .title(question.getTitle())
                .description(question.getDescription())
                .inputFormat(question.getInputFormat())
                .outputFormat(question.getOutputFormat())
                .constraints(question.getConstraints())
                .points(question.getPoints())
                .contestId(question.getContest().getId())
                .build();
    }
}
