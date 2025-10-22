package com.example.backend.revia.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.revia.dto.SendOtpRequest;
import com.example.backend.revia.dto.VerifyOtpRequest;
import com.example.backend.revia.service.OtpService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final OtpService otpService;

    public AuthController(OtpService otpService) {
        this.otpService = otpService;
    }

    /**
     * 1️⃣ 이메일로 인증번호 전송
     */
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(@RequestBody SendOtpRequest req) {
        String code = otpService.generateOtp(req.email());
        return ResponseEntity.ok("인증번호가 전송되었습니다. (테스트용 코드: " + code + ")");
    }

    /**
     * 2️⃣ 인증번호 검증
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody VerifyOtpRequest req) {
        boolean verified = otpService.validateOtp(req.email(), req.otp());
        if (verified) {
            return ResponseEntity.ok("✅ 인증 성공");
        } else {
            return ResponseEntity.badRequest().body("❌ 인증 실패. 코드가 올바르지 않습니다.");
        }
    }

    /**
     * 3️⃣ 이메일 인증 여부 조회 (선택)
     */
    @GetMapping("/verified/{email}")
    public ResponseEntity<Boolean> isVerified(@PathVariable String email) {
        return ResponseEntity.ok(otpService.isVerified(email));
    }
}
