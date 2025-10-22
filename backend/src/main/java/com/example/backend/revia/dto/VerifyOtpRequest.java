package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 인증번호 검증용 DTO
 */
public record VerifyOtpRequest(
        @Email @NotBlank String email,
        @NotBlank String otp
) {}
