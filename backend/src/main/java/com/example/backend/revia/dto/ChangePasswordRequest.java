package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 비밀번호 변경 요청 DTO
 * - 이메일 + OTP 인증 코드 + 새 비밀번호 포함
 */
public record ChangePasswordRequest(
        @Email @NotBlank String email,
        @NotBlank String otp,
        @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.") @NotBlank String newPassword
) {}
