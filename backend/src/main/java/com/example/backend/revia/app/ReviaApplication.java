package com.example.backend.revia.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

/**
 * ✅ REVIA — AI 전용 백엔드 진입점
 * - 로그인, 회원가입, OTP 관련 기능 제거
 * - AI 분석 기능만 실행
 */
@SpringBootApplication(
        scanBasePackages = "com.example.backend.revia",
        exclude = { SecurityAutoConfiguration.class } // 보안 관련 자동설정 제거
)
public class ReviaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReviaApplication.class, args);
    }
}
