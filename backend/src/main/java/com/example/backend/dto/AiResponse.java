package com.example.backend.dto;

public class AiResponse {
    private String color;
    private String design;
    private String pattern;
    private String style;
    private String[] keywords;

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDesign() { return design; }
    public void setDesign(String design) { this.design = design; }

    public String getPattern() { return pattern; }
    public void setPattern(String pattern) { this.pattern = pattern; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String[] getKeywords() { return keywords; }
    public void setKeywords(String[] keywords) { this.keywords = keywords; }
}
