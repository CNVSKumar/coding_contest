package com.contest.coding.service;

public interface CodeExecutionService {
    ExecutionResult execute(String sourceCode, String language, String inputData, String expectedOutput, long timeoutMs);
}
