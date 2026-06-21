package com.contest.coding.service;

import com.contest.coding.dto.testcase.TestCaseRequest;
import com.contest.coding.dto.testcase.TestCaseResponse;
import java.util.List;

public interface TestCaseService {
    TestCaseResponse createTestCase(Long questionId, TestCaseRequest request);
    TestCaseResponse updateTestCase(Long id, TestCaseRequest request);
    void deleteTestCase(Long id);
    List<TestCaseResponse> getTestCasesByQuestion(Long questionId);
}
