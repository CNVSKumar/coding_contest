package com.contest.coding.dto.submission;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionResponse {
    private Long id;
    private String sourceCode;
    private String language;
    private String status; // enum String
    private Integer score;
    private LocalDateTime submittedAt;
    private Long userId;
    private String userName;
    private Long questionId;
    private String questionTitle;
    private Long executionTimeMs;
    private String errorMessage;
}
