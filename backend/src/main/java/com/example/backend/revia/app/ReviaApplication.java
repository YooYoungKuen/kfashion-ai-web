package com.example.backend.revia.app;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * REVIA 백엔드의 메인 실행 클래스
 * - 스프링 부트 앱 진입점
 * - @SpringBootApplication 은 하위 모든 패키지를 스캔함
 *
 * 즉, com.example.backend.revia 이하의
 * controller, service, repository, entity, dto 패키지를 자동 인식합니다.
 */
@SpringBootApplication(scanBasePackages = "com.example.backend.revia")
public class ReviaApplication {
    public static void main(String[] args) {
        SpringApplication.run(ReviaApplication.class, args);
    }
}
