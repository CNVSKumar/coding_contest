package com.contest.coding.service;

import com.contest.coding.dto.leaderboard.LeaderboardResponse;

public interface LeaderboardService {
    LeaderboardResponse getContestLeaderboard(Long contestId);
}
