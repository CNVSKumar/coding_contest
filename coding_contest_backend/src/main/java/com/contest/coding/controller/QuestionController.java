package com.contest.coding.controller;

import com.contest.coding.dto.question.QuestionRequest;
import com.contest.coding.dto.question.QuestionResponse;
import com.contest.coding.service.QuestionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/contests/{contestId}/questions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> createQuestion(@PathVariable Long contestId, @Valid @RequestBody QuestionRequest request) {
        QuestionResponse response = questionService.createQuestion(contestId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<QuestionResponse> updateQuestion(@PathVariable Long id, @Valid @RequestBody QuestionRequest request) {
        QuestionResponse response = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/questions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/contests/{contestId}/questions")
    public ResponseEntity<List<QuestionResponse>> getQuestionsByContest(@PathVariable Long contestId) {
        List<QuestionResponse> response = questionService.getQuestionsByContest(contestId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/questions/{id}")
    public ResponseEntity<QuestionResponse> getQuestionById(@PathVariable Long id) {
        QuestionResponse response = questionService.getQuestionDetails(id);
        return ResponseEntity.ok(response);
    }
}
