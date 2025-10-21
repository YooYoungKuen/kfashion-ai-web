package com.example.backend.dto;

public class AiRequest {

    private String category;
    private String imageBase64;

    // 기본 생성자 (Spring이 JSON 변환할 때 필요)
    public AiRequest() {
    }

    // Getter / Setter
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
