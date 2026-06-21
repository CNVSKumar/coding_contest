package com.contest.coding.dto.submission;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubmissionRequest {

    @NotBlank(message = "Source code cannot be blank")
    private String sourceCode;

    @NotBlank(message = "Language cannot be blank")
    private String language; // JAVA or PYTHON

    @NotNull(message = "Question ID is required")
    private Long questionId;
}
