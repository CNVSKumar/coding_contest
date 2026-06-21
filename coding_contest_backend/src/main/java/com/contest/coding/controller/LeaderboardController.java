package com.contest.coding.controller;

import com.contest.coding.dto.leaderboard.LeaderboardResponse;
import com.contest.coding.service.LeaderboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/contests")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<LeaderboardResponse> getContestLeaderboard(@PathVariable Long contestId) {
        LeaderboardResponse response = leaderboardService.getContestLeaderboard(contestId);
        return ResponseEntity.ok(response);
    }
}
