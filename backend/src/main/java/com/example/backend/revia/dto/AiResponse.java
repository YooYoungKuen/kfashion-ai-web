package com.example.backend.revia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 이미지 분석 결과 DTO
 * - 프론트엔드에 color, design, pattern, style, keywords 정보 반환
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiResponse {
    private String color;
    private String design;
    private String pattern;
    private String style;
    private String[] keywords;
}
