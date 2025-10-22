package com.example.backend.revia.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청 DTO
 * - 이메일 형식 및 중복 체크는 백엔드 단에서 처리
 * - 비밀번호는 최소 6자 이상 필수
 */
public record SignupRequest(
        @Email @NotBlank String email,
        @Size(min = 6, message = "비밀번호는 최소 6자 이상이어야 합니다.") @NotBlank String password
) {}
