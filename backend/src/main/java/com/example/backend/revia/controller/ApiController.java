package com.example.backend.revia.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.*;

import com.example.backend.revia.dto.AiRequest;
import com.example.backend.revia.dto.AiResponse;

/**
 * AI 이미지 분석 요청 컨트롤러
 * - 프론트엔드에서 Base64 이미지를 받아 분석 결과(JSON) 반환
 */
@RestController
@RequestMapping("/api/ai")
public class ApiController {

    private static final Logger log = LoggerFactory.getLogger(ApiController.class);

    /**
     * AI 분석 요청 처리 (임시 테스트 버전)
     */
    @PostMapping("/analyze")
    public AiResponse analyze(@RequestBody AiRequest request) {
        log.info("📩 AI 분석 요청 도착: 카테고리 = {}", request.getCategory());
        if (request.getImageBase64() != null && request.getImageBase64().length() > 30) {
            log.info("이미지 Base64 앞부분: {}...", request.getImageBase64().substring(0, 30));
        }

        // 🔹 실제 모델 연동 전까지 테스트용 더미 응답 반환
        return AiResponse.builder()
                .color("베이지")
                .design("트렌치코트")
                .pattern("무지")
                .style("클래식")
                .keywords(new String[]{"가을", "오피스룩", "코트"})
                .build();
    }
}
