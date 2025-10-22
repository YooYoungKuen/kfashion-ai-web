package com.example.backend.revia.service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 인증번호 이메일 전송 서비스
 */
@Service
public class MailService {

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * 이메일 인증번호 전송
     * @param toEmail 수신자 이메일
     * @param code 인증번호
     */
    public void sendOtpMail(String toEmail, String code) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("[REVIA] 이메일 인증번호 안내");
        message.setText(
            "안녕하세요 REVIA입니다.\n\n" +
            "요청하신 인증번호는 아래와 같습니다.\n\n" +
            "🔐 인증번호: " + code + "\n\n" +
            "3분 이내에 입력해주세요.\n\n감사합니다."
        );

        mailSender.send(message);
    }
}
