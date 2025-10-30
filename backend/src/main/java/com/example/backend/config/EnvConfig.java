package com.example.backend.revia.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

@Configuration
public class EnvConfig {

    @PostConstruct
    public void loadEnv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("../") // 🔹 상위 폴더에서 .env 찾기
                    .load();

            dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
            );
            System.out.println("✅ .env 환경변수 불러오기 완료");
        } catch (Exception e) {
            System.out.println("⚠️ .env 파일을 불러오지 못했습니다: " + e.getMessage());
        }
    }
}
