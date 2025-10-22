package com.example.backend.revia.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.revia.entity.OtpToken;

/**
 * OTP 토큰 저장용 JPA Repository
 * - 이메일 기준으로 가장 최근 생성된 OTP 조회 가능
 */
@Repository
public interface OtpTokenRepository extends JpaRepository<OtpToken, Long> {
    Optional<OtpToken> findTopByEmailOrderByCreatedAtDesc(String email);
}
