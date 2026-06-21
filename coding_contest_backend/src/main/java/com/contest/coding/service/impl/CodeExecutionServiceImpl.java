package com.contest.coding.service.impl;

import com.contest.coding.entity.SubmissionStatus;
import com.contest.coding.service.CodeExecutionService;
import com.contest.coding.service.ExecutionResult;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeExecutionServiceImpl implements CodeExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(CodeExecutionServiceImpl.class);

    @Value("${app.sandbox.executor-type:local}")
    private String executorType;

    @Value("${app.sandbox.temp-dir:./sandbox_temp}")
    private String tempDir;

    @Value("${app.sandbox.timeout-ms:5000}")
    private long defaultTimeoutMs;

    @Override
    public ExecutionResult execute(String sourceCode, String language, String inputData, String expectedOutput, long timeoutMs) {
        long finalTimeoutMs = timeoutMs > 0 ? timeoutMs : defaultTimeoutMs;
        String runId = UUID.randomUUID().toString();
        Path sandboxPath = Paths.get(tempDir, "run_" + runId).toAbsolutePath();

        try {
            Files.createDirectories(sandboxPath);
        } catch (IOException e) {
            logger.error("Failed to create sandbox directory: {}", e.getMessage());
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("System Error: Failed to initialize execution sandbox.")
                    .build();
        }

        ExecutionResult result;
        try {
            if ("docker".equalsIgnoreCase(executorType)) {
                result = executeDocker(sourceCode, language, inputData, expectedOutput, sandboxPath, finalTimeoutMs);
            } else {
                result = executeLocal(sourceCode, language, inputData, expectedOutput, sandboxPath, finalTimeoutMs);
            }
        } finally {
            cleanupDirectory(sandboxPath.toFile());
        }

        return result;
    }

    private ExecutionResult executeLocal(String sourceCode, String language, String inputData, String expectedOutput, Path sandboxPath, long timeoutMs) {
        if ("JAVA".equalsIgnoreCase(language)) {
            return executeJavaLocal(sourceCode, inputData, expectedOutput, sandboxPath, timeoutMs);
        } else if ("PYTHON".equalsIgnoreCase(language)) {
            return executePythonLocal(sourceCode, inputData, expectedOutput, sandboxPath, timeoutMs);
        } else {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Unsupported language: " + language)
                    .build();
        }
    }

    private ExecutionResult executeDocker(String sourceCode, String language, String inputData, String expectedOutput, Path sandboxPath, long timeoutMs) {
        // We write the source code and input files to the sandbox path first
        String fileName;
        List<String> command = new ArrayList<>();
        command.add("docker");
        command.add("run");
        command.add("--rm");
        command.add("-i");
        command.add("--memory=128m");
        command.add("--cpus=0.5");
        // Mount local directory to container /app directory
        command.add("-v");
        command.add(sandboxPath.toString() + ":/app");
        command.add("-w");
        command.add("/app");

        if ("JAVA".equalsIgnoreCase(language)) {
            String className = extractClassName(sourceCode);
            fileName = className + ".java";
            try {
                Files.writeString(sandboxPath.resolve(fileName), sourceCode, StandardCharsets.UTF_8);
                Files.writeString(sandboxPath.resolve("input.txt"), inputData != null ? inputData : "", StandardCharsets.UTF_8);
            } catch (IOException e) {
                return ExecutionResult.builder()
                        .status(SubmissionStatus.RUNTIME_ERROR)
                        .errorMessage("Failed to write source files: " + e.getMessage())
                        .build();
            }

            command.add("openjdk:17-slim");
            command.add("sh");
            command.add("-c");
            command.add("javac " + fileName + " && java " + className);

        } else if ("PYTHON".equalsIgnoreCase(language)) {
            fileName = "solution.py";
            try {
                Files.writeString(sandboxPath.resolve(fileName), sourceCode, StandardCharsets.UTF_8);
                Files.writeString(sandboxPath.resolve("input.txt"), inputData != null ? inputData : "", StandardCharsets.UTF_8);
            } catch (IOException e) {
                return ExecutionResult.builder()
                        .status(SubmissionStatus.RUNTIME_ERROR)
                        .errorMessage("Failed to write source files: " + e.getMessage())
                        .build();
            }

            command.add("python:3.9-slim");
            command.add("python");
            command.add(fileName);
        } else {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Unsupported language in Docker mode: " + language)
                    .build();
        }

        // Run process
        try {
            return runProcess(command, sandboxPath, expectedOutput, timeoutMs, true);
        } catch (Exception e) {
            logger.warn("Docker execution failed (is Docker running?). Falling back to local execution. Error: {}", e.getMessage());
            // Fallback to local
            return executeLocal(sourceCode, language, inputData, expectedOutput, sandboxPath, timeoutMs);
        }
    }

    private ExecutionResult executeJavaLocal(String sourceCode, String inputData, String expectedOutput, Path sandboxPath, long timeoutMs) {
        String className = extractClassName(sourceCode);
        String fileName = className + ".java";
        Path sourcePath = sandboxPath.resolve(fileName);

        try {
            Files.writeString(sourcePath, sourceCode, StandardCharsets.UTF_8);
            Files.writeString(sandboxPath.resolve("input.txt"), inputData != null ? inputData : "", StandardCharsets.UTF_8);
        } catch (IOException e) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Failed to write java source file: " + e.getMessage())
                    .build();
        }

        // Compile
        List<String> compileCmd = List.of("javac", fileName);
        ProcessBuilder compilePb = new ProcessBuilder(compileCmd);
        compilePb.directory(sandboxPath.toFile());
        File compileErrFile = sandboxPath.resolve("compile_err.txt").toFile();
        compilePb.redirectError(compileErrFile);

        try {
            Process compileProcess = compilePb.start();
            boolean compiled = compileProcess.waitFor(15, TimeUnit.SECONDS);
            if (!compiled) {
                compileProcess.destroyForcibly();
                return ExecutionResult.builder()
                        .status(SubmissionStatus.COMPILATION_ERROR)
                        .errorMessage("Compilation timed out after 15 seconds.")
                        .build();
            }

            if (compileProcess.exitValue() != 0) {
                String errorMsg = Files.readString(compileErrFile.toPath(), StandardCharsets.UTF_8);
                return ExecutionResult.builder()
                        .status(SubmissionStatus.COMPILATION_ERROR)
                        .errorMessage(errorMsg)
                        .build();
            }
        } catch (IOException | InterruptedException e) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.COMPILATION_ERROR)
                    .errorMessage("Compilation process error: " + e.getMessage())
                    .build();
        }

        // Run
        List<String> runCmd = List.of("java", className);
        try {
            return runProcess(runCmd, sandboxPath, expectedOutput, timeoutMs, false);
        } catch (IOException | InterruptedException e) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Runtime process error: " + e.getMessage())
                    .build();
        }
    }

    private ExecutionResult executePythonLocal(String sourceCode, String inputData, String expectedOutput, Path sandboxPath, long timeoutMs) {
        String fileName = "solution.py";
        Path sourcePath = sandboxPath.resolve(fileName);

        try {
            Files.writeString(sourcePath, sourceCode, StandardCharsets.UTF_8);
            Files.writeString(sandboxPath.resolve("input.txt"), inputData != null ? inputData : "", StandardCharsets.UTF_8);
        } catch (IOException e) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Failed to write python source file: " + e.getMessage())
                    .build();
        }

        // Find Python executable command
        String pythonCmd = "python";
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            // Check if py or python works
            try {
                new ProcessBuilder("python", "--version").start().waitFor();
            } catch (Exception e) {
                pythonCmd = "py";
            }
        } else {
            // Linux/macOS fallback
            try {
                new ProcessBuilder("python3", "--version").start().waitFor();
                pythonCmd = "python3";
            } catch (Exception e) {
                pythonCmd = "python";
            }
        }

        List<String> runCmd = List.of(pythonCmd, fileName);
        try {
            return runProcess(runCmd, sandboxPath, expectedOutput, timeoutMs, false);
        } catch (IOException | InterruptedException e) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .errorMessage("Python runtime process error: " + e.getMessage())
                    .build();
        }
    }

    private ExecutionResult runProcess(List<String> command, Path sandboxPath, String expectedOutput, long timeoutMs, boolean isDocker)
            throws IOException, InterruptedException {
        ProcessBuilder pb = new ProcessBuilder(command);
        pb.directory(sandboxPath.toFile());

        File inputFile = sandboxPath.resolve("input.txt").toFile();
        File outputFile = sandboxPath.resolve("output.txt").toFile();
        File errorFile = sandboxPath.resolve("error.txt").toFile();

        // Redirect files
        pb.redirectInput(inputFile);
        pb.redirectOutput(outputFile);
        pb.redirectError(errorFile);

        long start = System.currentTimeMillis();
        Process process = pb.start();

        boolean finished = process.waitFor(timeoutMs, TimeUnit.MILLISECONDS);
        long elapsed = System.currentTimeMillis() - start;

        if (!finished) {
            process.destroyForcibly();
            // In Docker mode, make sure container is terminated
            if (isDocker) {
                try {
                    new ProcessBuilder("docker", "ps", "-q").start();
                } catch (Exception ignored) {}
            }
            return ExecutionResult.builder()
                    .status(SubmissionStatus.TIME_LIMIT_EXCEEDED)
                    .executionTimeMs(elapsed)
                    .errorMessage("Time Limit Exceeded")
                    .build();
        }

        if (process.exitValue() != 0) {
            String errorMsg = Files.readString(errorFile.toPath(), StandardCharsets.UTF_8);
            // Docker occasionally writes container startup warnings, clean it up if it has content but also check exit value
            if (errorMsg.isEmpty()) {
                errorMsg = "Runtime error: process exited with status code " + process.exitValue();
            }
            return ExecutionResult.builder()
                    .status(SubmissionStatus.RUNTIME_ERROR)
                    .executionTimeMs(elapsed)
                    .errorMessage(errorMsg)
                    .build();
        }

        String actualOutput = Files.readString(outputFile.toPath(), StandardCharsets.UTF_8);

        if (compareOutputs(actualOutput, expectedOutput)) {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.ACCEPTED)
                    .executionTimeMs(elapsed)
                    .output(actualOutput)
                    .build();
        } else {
            return ExecutionResult.builder()
                    .status(SubmissionStatus.WRONG_ANSWER)
                    .executionTimeMs(elapsed)
                    .output(actualOutput)
                    .errorMessage("Wrong Answer. Output mismatch.")
                    .build();
        }
    }

    private boolean compareOutputs(String actual, String expected) {
        if (actual == null) actual = "";
        if (expected == null) expected = "";

        // Standardize output comparison:
        // Trim each line, remove empty lines at the end, and ignore carriage returns.
        String[] actualLines = actual.split("\\r?\\n");
        String[] expectedLines = expected.split("\\r?\\n");

        List<String> cleanActual = cleanLines(actualLines);
        List<String> cleanExpected = cleanLines(expectedLines);

        if (cleanActual.size() != cleanExpected.size()) {
            return false;
        }

        for (int i = 0; i < cleanActual.size(); i++) {
            if (!cleanActual.get(i).equals(cleanExpected.get(i))) {
                return false;
            }
        }

        return true;
    }

    private List<String> cleanLines(String[] lines) {
        List<String> list = new ArrayList<>();
        for (String line : lines) {
            list.add(line.stripTrailing());
        }
        // Remove trailing empty lines
        while (!list.isEmpty() && list.get(list.size() - 1).isEmpty()) {
            list.remove(list.size() - 1);
        }
        return list;
    }

    private String extractClassName(String sourceCode) {
        Pattern pattern = Pattern.compile("public\\s+class\\s+([A-Za-z0-9_]+)");
        Matcher matcher = pattern.matcher(sourceCode);
        if (matcher.find()) {
            return matcher.group(1);
        }
        pattern = Pattern.compile("class\\s+([A-Za-z0-9_]+)");
        matcher = pattern.matcher(sourceCode);
        if (matcher.find()) {
            return matcher.group(1);
        }
        return "Main";
    }

    private void cleanupDirectory(File dir) {
        if (dir.exists()) {
            File[] files = dir.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        cleanupDirectory(file);
                    } else {
                        file.delete();
                    }
                }
            }
            dir.delete();
        }
    }
}
