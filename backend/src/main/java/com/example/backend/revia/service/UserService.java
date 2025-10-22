package com.example.backend.revia.service;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.revia.entity.User;
import com.example.backend.revia.repository.UserRepository;

import lombok.RequiredArgsConstructor;

/**
 * 사용자 관련 비즈니스 로직
 * - 회원가입
 * - 로그인
 * - 비밀번호 변경
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepo;

    /** 회원가입 */
    public void register(String email, String password) {
        String hash = BCrypt.hashpw(password, BCrypt.gensalt());
        User user = User.builder()
                .email(email)
                .passwordHash(hash)
                .build();
        userRepo.save(user);
    }

    /** 로그인 */
    public boolean login(String email, String password) {
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty()) return false;
        return BCrypt.checkpw(password, opt.get().getPasswordHash());
    }

    /** 비밀번호 변경 */
    public boolean changePassword(String email, String newPassword) {
        Optional<User> opt = userRepo.findByEmail(email);
        if (opt.isEmpty()) return false;

        User user = opt.get();
        user.setPasswordHash(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userRepo.save(user);
        return true;
    }
}
