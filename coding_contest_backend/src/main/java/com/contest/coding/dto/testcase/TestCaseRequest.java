package com.contest.coding.dto.testcase;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TestCaseRequest {

    private String inputData;

    @NotBlank(message = "Expected output cannot be blank")
    private String expectedOutput;
}
