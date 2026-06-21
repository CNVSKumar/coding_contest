package com.contest.coding.service;

import com.contest.coding.entity.SubmissionStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExecutionResult {
    private SubmissionStatus status;
    private long executionTimeMs;
    private String output;
    private String errorMessage;
}
