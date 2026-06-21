package com.contest.coding.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardEntryResponse {
    private Integer rank;
    private Long userId;
    private String userName;
    private Integer totalScore;
    private Integer solvedCount;
    private Long submissionTimeMinutes; // Sum of minutes from contest start for accepted submissions
}
