package com.contest.coding.dto.contest;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ContestRequest {

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 3, max = 150, message = "Title must be between 3 and 150 characters")
    private String title;

    private String description;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    private String status; // UPCOMING, ACTIVE, COMPLETED (optional in request, will be computed/validated)
}
