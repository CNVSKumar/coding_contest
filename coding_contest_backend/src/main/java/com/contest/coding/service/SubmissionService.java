package com.contest.coding.service;

import com.contest.coding.dto.submission.SubmissionRequest;
import com.contest.coding.dto.submission.SubmissionResponse;
import java.util.List;

public interface SubmissionService {
    SubmissionResponse submitSolution(SubmissionRequest request, String userEmail);
    SubmissionResponse getSubmissionStatus(Long id);
    List<SubmissionResponse> getUserSubmissionHistory(String userEmail);
    List<SubmissionResponse> getAllSubmissions();
}
