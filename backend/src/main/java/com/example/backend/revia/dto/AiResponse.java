package com.example.backend.revia.dto;

import java.util.List;

public class AiResponse {
    private String analysis;
    private List<String> outfits;

    public AiResponse() {}

    public AiResponse(String analysis, List<String> outfits) {
        this.analysis = analysis;
        this.outfits = outfits;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public List<String> getOutfits() {
        return outfits;
    }

    public void setOutfits(List<String> outfits) {
        this.outfits = outfits;
    }
}
