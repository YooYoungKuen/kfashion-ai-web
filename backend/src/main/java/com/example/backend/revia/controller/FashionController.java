package com.example.backend.revia.controller;

import io.github.cdimascio.dotenv.Dotenv;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/fashion")
public class FashionController {

    private final String apiKey;
    private final RestTemplate restTemplate = new RestTemplate();

    public FashionController() {
        Dotenv dotenv = Dotenv.load();
        this.apiKey = dotenv.get("OPENAI_API_KEY");
    }

    /**
     * 업로드된 옷을 중심으로 전체 착장 코디 구성
     * 반환: { magazine, mainItem, outfitSet, shopQueries[] }
     */
    @PostMapping(value = "/analyze-item", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> analyzeItem(
            @RequestParam("file") MultipartFile file,
            @RequestParam("gender") String gender // "male" | "female"
    ) {
        try {
            String mime = file.getContentType() == null ? "image/jpeg" : file.getContentType();
            String base64 = Base64.getEncoder().encodeToString(file.getBytes());
            String dataUrl = "data:" + mime + ";base64," + base64;

            JSONObject body = new JSONObject();
            body.put("model", "gpt-4o");

            JSONArray messages = new JSONArray();

            // ✅ 시스템 프롬프트 (전체 착장 구성 중심)
            messages.put(new JSONObject()
                    .put("role", "system")
                    .put("content",
                            "너는 럭셔리 패션 매거진의 AI 스타일 에디터이자 코디 디자이너다. " +
                            "사용자가 업로드한 의류를 중심으로 어울리는 전체 착장(전신 코디 세트)을 구성하라. " +
                            "반드시 아래 JSON 스키마로만 응답하고, 불필요한 설명이나 마크다운은 금지한다.\n\n" +
                            "{\n" +
                            "  \"magazine\": \"5~7줄의 감각적이고 현실적인 스타일 에디터 문장 (계절감·무드·조합 이유)\",\n" +
                            "  \"mainItem\": \"업로드된 옷의 핵심 요약 (예: 카멜색 트렌치코트)\",\n" +
                            "  \"outfitSet\": {\n" +
                            "     \"top\": \"상의 제안 (예: 울 니트, 스트라이프 셔츠 등)\",\n" +
                            "     \"bottom\": \"하의 제안 (예: 슬림핏 슬랙스, 크림진 등)\",\n" +
                            "     \"outer\": \"아우터 제안 (예: 블레이저, 숏패딩 등)\",\n" +
                            "     \"shoes\": \"신발 제안 (예: 더비슈즈, 스니커즈 등)\",\n" +
                            "     \"accessories\": [\"악세사리 2~3개 (예: 가죽벨트, 실버시계, 스카프 등)\"]\n" +
                            "  },\n" +
                            "  \"shopQueries\": [\"무신사 또는 네이버쇼핑에서 실제 검색 시 유효한 브랜드+아이템 조합 5~8개\"]\n" +
                            "}\n" +
                            "성별 단서: " + ("male".equalsIgnoreCase(gender) ? "남성" : "여성") +
                            " / 시즌 단서: 사계절 중 현재 계절에 어울리는 코디로 제안하라.")
            );

            // ✅ 사용자 입력 (이미지)
            JSONArray content = new JSONArray();
            content.put(new JSONObject().put("type", "text").put("text", 
                    "다음 옷 이미지를 분석하고 위 스키마에 맞춰 전체 착장을 JSON으로만 반환해."));
            content.put(new JSONObject()
                    .put("type", "image_url")
                    .put("image_url", new JSONObject().put("url", dataUrl)));

            messages.put(new JSONObject().put("role", "user").put("content", content));
            body.put("messages", messages);

            // ✅ OpenAI API 호출
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);

            HttpEntity<String> entity = new HttpEntity<>(body.toString(), headers);
            ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.openai.com/v1/chat/completions",
                    entity,
                    String.class
            );

            if (!response.getStatusCode().is2xxSuccessful()) {
                return ResponseEntity.status(response.getStatusCode()).body(response.getBody());
            }

            // ✅ 응답 파싱
            JSONObject res = new JSONObject(response.getBody());
            String contentStr = res.getJSONArray("choices")
                    .getJSONObject(0)
                    .getJSONObject("message")
                    .getString("content");

            JSONObject parsed;
            try {
                parsed = new JSONObject(contentStr);
            } catch (Exception e) {
                String trimmed = contentStr.replaceAll("```json", "")
                        .replaceAll("```", "")
                        .trim();
                parsed = new JSONObject(trimmed);
            }

            // ✅ 최종 반환 데이터 구성
            Map<String, Object> result = new HashMap<>();
            result.put("gender", "male".equalsIgnoreCase(gender) ? "남성" : "여성");
            result.put("magazine", parsed.optString("magazine", ""));
            result.put("mainItem", parsed.optString("mainItem", ""));
            result.put("outfitSet", parsed.optJSONObject("outfitSet") != null ? parsed.getJSONObject("outfitSet").toMap() : new HashMap<>());
            result.put("shopQueries", parsed.optJSONArray("shopQueries") != null ? parsed.getJSONArray("shopQueries").toList() : new JSONArray().toList());

            return ResponseEntity.ok(result);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
