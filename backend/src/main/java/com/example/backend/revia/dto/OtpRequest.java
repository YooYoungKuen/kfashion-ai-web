package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * OTP 재전송 또는 이메일 인증 요청 DTO
 * - SendOtpRequest와 동일하지만, 특정 기능(예: 비밀번호 변경, 재전송)에 사용 가능
 */
public record OtpRequest(
        @Email @NotBlank String email
) {}
