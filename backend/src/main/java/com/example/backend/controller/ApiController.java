package com.example.backend.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.AiRequest;
import com.example.backend.dto.AiResponse;

@RestController
@RequestMapping("/api/ai")
public class ApiController {

    @PostMapping("/analyze")
    public AiResponse analyze(@RequestBody AiRequest request) {
        System.out.println("📩 분석 요청 도착: " + request.getCategory());
        System.out.println("이미지 데이터 앞부분: " + request.getImageBase64().substring(0, 30));

        AiResponse response = new AiResponse();
        response.setColor("베이지");
        response.setDesign("트렌치코트");
        response.setPattern("무지");
        response.setStyle("클래식");
        response.setKeywords(new String[]{"가을", "오피스룩", "코트"});
        return response;
    }
}
