package com.example.backend.revia.dto;

import java.util.List;

/**
 * AI 분석 결과를 반환하는 DTO
 */
public class AiResponse {
    private String color;
    private String design;
    private String pattern;
    private String style;
    private List<String> keywords;

    public AiResponse() {}

    public AiResponse(String color, String design, String pattern, String style, List<String> keywords) {
        this.color = color;
        this.design = design;
        this.pattern = pattern;
        this.style = style;
        this.keywords = keywords;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getDesign() {
        return design;
    }

    public void setDesign(String design) {
        this.design = design;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public String getStyle() {
        return style;
    }

    public void setStyle(String style) {
        this.style = style;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }
}
