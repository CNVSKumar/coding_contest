package com.contest.coding.dto.question;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    @NotBlank(message = "Description cannot be blank")
    private String description;

    private String inputFormat;

    private String outputFormat;

    private String constraints;

    @NotNull(message = "Points is required")
    @Min(value = 0, message = "Points must be non-negative")
    private Integer points;
}
