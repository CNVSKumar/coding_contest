package com.contest.coding.service.impl;

import com.contest.coding.dto.testcase.TestCaseRequest;
import com.contest.coding.dto.testcase.TestCaseResponse;
import com.contest.coding.entity.Question;
import com.contest.coding.entity.TestCase;
import com.contest.coding.exception.ResourceNotFoundException;
import com.contest.coding.repository.QuestionRepository;
import com.contest.coding.repository.TestCaseRepository;
import com.contest.coding.service.TestCaseService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TestCaseServiceImpl implements TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final QuestionRepository questionRepository;

    public TestCaseServiceImpl(TestCaseRepository testCaseRepository, QuestionRepository questionRepository) {
        this.testCaseRepository = testCaseRepository;
        this.questionRepository = questionRepository;
    }

    @Override
    @Transactional
    public TestCaseResponse createTestCase(Long questionId, TestCaseRequest request) {
        Question question = questionRepository.findById(questionId)
                .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        TestCase testCase = TestCase.builder()
                .inputData(request.getInputData())
                .expectedOutput(request.getExpectedOutput())
                .question(question)
                .build();

        TestCase savedTestCase = testCaseRepository.save(testCase);
        return mapToResponse(savedTestCase);
    }

    @Override
    @Transactional
    public TestCaseResponse updateTestCase(Long id, TestCaseRequest request) {
        TestCase testCase = testCaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TestCase not found with id: " + id));

        testCase.setInputData(request.getInputData());
        testCase.setExpectedOutput(request.getExpectedOutput());

        TestCase updatedTestCase = testCaseRepository.save(testCase);
        return mapToResponse(updatedTestCase);
    }

    @Override
    @Transactional
    public void deleteTestCase(Long id) {
        if (!testCaseRepository.existsById(id)) {
            throw new ResourceNotFoundException("TestCase not found with id: " + id);
        }
        testCaseRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TestCaseResponse> getTestCasesByQuestion(Long questionId) {
        if (!questionRepository.existsById(questionId)) {
            throw new ResourceNotFoundException("Question not found with id: " + questionId);
        }
        return testCaseRepository.findByQuestionId(questionId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private TestCaseResponse mapToResponse(TestCase testCase) {
        return TestCaseResponse.builder()
                .id(testCase.getId())
                .inputData(testCase.getInputData())
                .expectedOutput(testCase.getExpectedOutput())
                .questionId(testCase.getQuestion().getId())
                .build();
    }
}
