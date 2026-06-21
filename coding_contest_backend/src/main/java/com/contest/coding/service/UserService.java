package com.contest.coding.service;

import com.contest.coding.dto.auth.JwtResponse;
import com.contest.coding.dto.auth.LoginRequest;
import com.contest.coding.dto.auth.RegisterRequest;
import com.contest.coding.entity.User;

public interface UserService {
    JwtResponse login(LoginRequest request);
    User register(RegisterRequest request);
}
