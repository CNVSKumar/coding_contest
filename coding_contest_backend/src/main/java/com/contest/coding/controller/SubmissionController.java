package com.contest.coding.controller;

import com.contest.coding.dto.submission.SubmissionRequest;
import com.contest.coding.dto.submission.SubmissionResponse;
import com.contest.coding.service.SubmissionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<SubmissionResponse> submitSolution(@Valid @RequestBody SubmissionRequest request, Authentication authentication) {
        String email = authentication.getName();
        SubmissionResponse response = submissionService.submitSolution(request, email);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('PARTICIPANT')")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissionHistory(Authentication authentication) {
        String email = authentication.getName();
        List<SubmissionResponse> response = submissionService.getUserSubmissionHistory(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubmissionResponse> getSubmissionById(@PathVariable Long id) {
        SubmissionResponse response = submissionService.getSubmissionStatus(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SubmissionResponse>> getAllSubmissions() {
        List<SubmissionResponse> response = submissionService.getAllSubmissions();
        return ResponseEntity.ok(response);
    }
}
