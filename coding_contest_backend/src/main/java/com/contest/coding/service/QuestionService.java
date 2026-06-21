package com.contest.coding.service;

import com.contest.coding.dto.question.QuestionRequest;
import com.contest.coding.dto.question.QuestionResponse;
import java.util.List;

public interface QuestionService {
    QuestionResponse createQuestion(Long contestId, QuestionRequest request);
    QuestionResponse updateQuestion(Long id, QuestionRequest request);
    void deleteQuestion(Long id);
    List<QuestionResponse> getQuestionsByContest(Long contestId);
    QuestionResponse getQuestionDetails(Long id);
}
