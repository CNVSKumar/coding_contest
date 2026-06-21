package com.contest.coding.service;

import com.contest.coding.dto.contest.ContestRequest;
import com.contest.coding.dto.contest.ContestResponse;
import java.util.List;

public interface ContestService {
    ContestResponse createContest(ContestRequest request);
    ContestResponse updateContest(Long id, ContestRequest request);
    void deleteContest(Long id);
    ContestResponse getContestDetails(Long id);
    List<ContestResponse> getAllContests();
}
