package com.example.backend.revia.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.revia.dto.AiRequest;
import com.example.backend.revia.dto.AiResponse;
import com.example.backend.revia.service.AiService;

/**
 * AI 이미지 분석 요청을 처리하는 컨트롤러
 */
@RestController
@RequestMapping("/api/ai")
public class ApiController {

    private final AiService aiService;

    @Autowired
    public ApiController(AiService aiService) {
        this.aiService = aiService;
    }

    /**
     * POST /api/ai/analyze
     * - 프론트엔드에서 Base64 이미지와 카테고리 전송
     * - AI 분석 결과 JSON 반환
     */
    @PostMapping("/analyze")
    public AiResponse analyze(@RequestBody AiRequest request) {
        return aiService.analyze(request);
    }
}
