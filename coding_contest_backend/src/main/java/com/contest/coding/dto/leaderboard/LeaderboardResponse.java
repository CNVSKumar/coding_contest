package com.contest.coding.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {
    private Long contestId;
    private String contestTitle;
    private List<LeaderboardEntryResponse> entries;
}
