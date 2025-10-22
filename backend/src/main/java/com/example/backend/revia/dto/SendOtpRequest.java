package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/**
 * 이메일 인증번호 요청 DTO
 * - 클라이언트가 인증번호 전송을 요청할 때 사용
 */
public record SendOtpRequest(
        @Email @NotBlank String email
) {}
