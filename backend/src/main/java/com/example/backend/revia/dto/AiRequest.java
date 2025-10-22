package com.example.backend.revia.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI 이미지 분석 요청 DTO
 * - category: 분석할 이미지 카테고리 (예: 상의, 하의, 원피스 등)
 * - imageBase64: Base64 인코딩된 이미지 문자열
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiRequest {
    private String category;
    private String imageBase64;
}
