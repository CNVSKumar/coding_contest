package com.contest.coding.controller;

import com.contest.coding.dto.auth.JwtResponse;
import com.contest.coding.dto.auth.LoginRequest;
import com.contest.coding.dto.auth.RegisterRequest;
import com.contest.coding.entity.User;
import com.contest.coding.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<JwtResponse> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        JwtResponse jwtResponse = userService.login(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        User user = userService.register(registerRequest);
        return new ResponseEntity<>(user, HttpStatus.CREATED);
    }
}
