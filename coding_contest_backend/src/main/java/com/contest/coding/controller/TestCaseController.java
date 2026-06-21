package com.contest.coding.controller;

import com.contest.coding.dto.testcase.TestCaseRequest;
import com.contest.coding.dto.testcase.TestCaseResponse;
import com.contest.coding.service.TestCaseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
@PreAuthorize("hasRole('ADMIN')")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(TestCaseService testCaseService) {
        this.testCaseService = testCaseService;
    }

    @PostMapping("/questions/{questionId}/testcases")
    public ResponseEntity<TestCaseResponse> createTestCase(@PathVariable Long questionId, @Valid @RequestBody TestCaseRequest request) {
        TestCaseResponse response = testCaseService.createTestCase(questionId, request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/testcases/{id}")
    public ResponseEntity<TestCaseResponse> updateTestCase(@PathVariable Long id, @Valid @RequestBody TestCaseRequest request) {
        TestCaseResponse response = testCaseService.updateTestCase(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/testcases/{id}")
    public ResponseEntity<Void> deleteTestCase(@PathVariable Long id) {
        testCaseService.deleteTestCase(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/questions/{questionId}/testcases")
    public ResponseEntity<List<TestCaseResponse>> getTestCasesByQuestion(@PathVariable Long questionId) {
        List<TestCaseResponse> response = testCaseService.getTestCasesByQuestion(questionId);
        return ResponseEntity.ok(response);
    }
}
