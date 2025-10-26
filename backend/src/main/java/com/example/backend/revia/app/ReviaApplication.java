package com.example.backend.revia.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.example.backend.revia")  // ✅ 이 줄 중요!
public class ReviaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReviaApplication.class, args);
    }
}
