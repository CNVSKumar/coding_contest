package com.contest.coding.controller;

import com.contest.coding.dto.contest.ContestRequest;
import com.contest.coding.dto.contest.ContestResponse;
import com.contest.coding.service.ContestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContestResponse> createContest(@Valid @RequestBody ContestRequest request) {
        ContestResponse response = contestService.createContest(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ContestResponse> updateContest(@PathVariable Long id, @Valid @RequestBody ContestRequest request) {
        ContestResponse response = contestService.updateContest(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteContest(@PathVariable Long id) {
        contestService.deleteContest(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(@PathVariable Long id) {
        ContestResponse response = contestService.getContestDetails(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests() {
        List<ContestResponse> response = contestService.getAllContests();
        return ResponseEntity.ok(response);
    }
}
