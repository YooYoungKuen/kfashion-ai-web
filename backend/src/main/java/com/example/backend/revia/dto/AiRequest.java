package com.example.backend.revia.dto;

public class AiRequest {
    private String prompt;

    public AiRequest() {}

    public AiRequest(String prompt) {
        this.prompt = prompt;
    }

    public String getPrompt() {
        return prompt;
    }

    public void setPrompt(String prompt) {
        this.prompt = prompt;
    }
}
