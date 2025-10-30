package com.example.backend.revia.controller;

import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/fashion")
public class FashionImageController {

    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();

    public FashionImageController() {
        Dotenv dotenv = Dotenv.load();
        this.apiKey = dotenv.get("OPENAI_API_KEY");
    }

    /**
     * ✅ REVIA — AI 패션 화보 생성 (완성형)
     * - 모델 1명 전신
     * - 색상+의류 결합 표현
     * - 한국형 유행 감각 반영
     * - 이미지 간 색상/톤/포즈 다양화
     */
    @PostMapping("/generate-outfit")
    public ResponseEntity<?> generateOutfit(@RequestBody Map<String, Object> req) {
        try {
            String gender = String.valueOf(req.getOrDefault("gender", "중성"));
            String title = String.valueOf(req.getOrDefault("title", "스타일"));
            String matchTip = String.valueOf(req.getOrDefault("matchTip", ""));
            String colorTip = String.valueOf(req.getOrDefault("colorTip", ""));
            String accessoryTip = String.valueOf(req.getOrDefault("accessoryTip", ""));

            // ✅ 색상 + 의류 결합 문장 생성
            String combinedStyle = String.format("%s %s", colorTip, matchTip)
                    .replaceAll("\\s+", " ")
                    .replaceAll("색 의", "색의")
                    .trim();

            // ✅ 프롬프트 — 다양성 + 1인 전신 + 한국형 감성
            String prompt = String.format(
                "%s용 %s 패션 룩북 화보.\n" +
                "👤 각 이미지는 반드시 한 명의 모델만 등장하며, 다른방면 금지 똑같은사람이라도 무조건 사람모습 하나만, 머리부터 발끝까지 전신이 세로 구도로 자연스럽게 보여야 함.\n" +
                "세 장의 사진 모두 모델은 한 명씩, 전신이 모두 보이며 얼굴은 한 명만 등장해야 함.\n" +
                "현실적인 인체 비율, 자연광, 사실적인 질감, 고급스러운 룩북 스타일.\n" +
                "코디 구성: %s\n" +
                "각 아이템은 색상과 품목이 반드시 결합된 형태로 표현해야 함. (예: '카멜색 트렌치코트', '화이트 셔츠', '네이비 슬랙스')\n" +
                "생성되는 각 이미지는 내가 선택한 이미지 색상은 그대로 쓰고 서로 다른 색상·톤·소재 조합을 가져야 하며, 중복되는 컬러 없이 명확히 구분되도록 구성.\n" +
                "특히 상의와 하의의 색상 대비를 강조하고, 악세사리 [%s]는 자연스럽게 어울리게.\n" +
                "사진마다 조명, 포즈, 배경 톤, 무드, 카메라 앵글이 서로 똑같이 구성되어야 함.\n" +
                "한국형 감성 (미니멀, 스트릿, 데일리, 시크, 모던) 기반의 **2026 최신 트렌드** 반영.\n" +
                "잡지 화보 품질, 고해상도, 단순하고 세련된 배경, 현실적인 질감, 패션 화보 수준의 조명과 포즈."
                , gender, title, combinedStyle, accessoryTip
            );

            JSONObject body = new JSONObject();
            body.put("model", "dall-e-3");
            body.put("prompt", prompt);
            body.put("size", "1024x1024");
            body.put("n", 1);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/images/generations",
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            }

            JSONObject res = new JSONObject(response.getBody());
            String url = res.getJSONArray("data").getJSONObject(0).getString("url");

            return ResponseEntity.ok(Map.of(
                    "imageUrl", url,
                    "stylePrompt", combinedStyle
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
