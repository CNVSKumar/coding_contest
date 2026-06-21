package com.contest.coding.dto.testcase;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestCaseResponse {
    private Long id;
    private String inputData;
    private String expectedOutput;
    private Long questionId;
}
