package com.example.backend.revia.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * OTP(이메일 인증번호) 토큰 엔티티
 * builder(), getter(), setter() 등 자동 생성
 */
@Entity
@Table(name = "otp_token")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private boolean verified;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    /** 생성 시 createdAt 자동 설정 */
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    /** JPA boolean 호환 (isVerified / getVerified 둘 다 제공) */
    public boolean isVerified() {
        return verified;
    }

    public boolean getVerified() {
        return verified;
    }
}
