package com.example.backend.revia.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.revia.entity.OtpToken;
import com.example.backend.revia.repository.OtpTokenRepository;

/**
 * OTP(이메일 인증번호) 생성, 발송, 검증, 상태확인 서비스
 */
@Service
public class OtpService {

    private static final int OTP_EXPIRE_MINUTES = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpTokenRepository otpRepo;
    private final MailService mailService;

    public OtpService(OtpTokenRepository otpRepo, MailService mailService) {
        this.otpRepo = otpRepo;
        this.mailService = mailService;
    }

    /**
     * 1️⃣ 인증번호 생성 및 이메일 발송
     */
    @Transactional
    public String generateOtp(String email) {
        String code = String.format("%06d", RANDOM.nextInt(1_000_000));

        OtpToken token = OtpToken.builder()
                .email(email)
                .code(code)
                .verified(false)
                .createdAt(LocalDateTime.now())
                .build();

        otpRepo.save(token);

        mailService.sendOtpMail(email, code);

        return code;
    }

    /**
     * 2️⃣ 인증번호 검증
     */
    @Transactional
    public boolean validateOtp(String email, String code) {
        Optional<OtpToken> opt = otpRepo.findTopByEmailOrderByCreatedAtDesc(email);
        if (opt.isEmpty()) return false;

        OtpToken token = opt.get();

        // 3분 이내 유효
        if (token.getCreatedAt().isBefore(LocalDateTime.now().minusMinutes(OTP_EXPIRE_MINUTES))) {
            return false;
        }

        // 코드 불일치 시 실패
        if (!token.getCode().equals(code)) {
            return false;
        }

        // 인증 성공
        token.setVerified(true);
        otpRepo.save(token);
        return true;
    }

    /**
     * 3️⃣ 이메일 인증 여부 확인
     */
    public boolean isVerified(String email) {
        return otpRepo.findTopByEmailOrderByCreatedAtDesc(email)
                .map(OtpToken::isVerified) // ✅ 정상 작동
                .orElse(false);
    }
}
