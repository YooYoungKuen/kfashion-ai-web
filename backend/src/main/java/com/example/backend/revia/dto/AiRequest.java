package com.example.backend.revia.dto;

/**
 * 프론트엔드에서 이미지 분석 요청 시 사용하는 DTO
 */
public class AiRequest {
    private String category;
    private String imageBase64;

    public AiRequest() {}

    public AiRequest(String category, String imageBase64) {
        this.category = category;
        this.imageBase64 = imageBase64;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getImageBase64() {
        return imageBase64;
    }

    public void setImageBase64(String imageBase64) {
        this.imageBase64 = imageBase64;
    }
}
