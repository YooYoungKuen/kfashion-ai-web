package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 로그인 요청 DTO
 * - 이메일/비밀번호 기반 로그인 시 사용
 */
public record LoginRequest(
        @Email @NotBlank String email,
        @NotBlank String password
) {}
