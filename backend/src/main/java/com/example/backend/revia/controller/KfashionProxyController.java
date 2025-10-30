// backend/src/main/java/com/example/backend/revia/controller/KfashionProxyController.java
package com.example.backend.revia.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class KfashionProxyController {

    @Value("${kfashion.base-url}")
    private String kfashionBaseUrl; // 예: http://127.0.0.1:8001

    private final RestTemplate rest = new RestTemplate();

    @PostMapping(value = "/predict", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<byte[]> predict(@RequestPart("file") MultipartFile file) {
        try {
            // FastAPI로 멀티파트 그대로 전달
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            LinkedMultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", new ByteArrayResource(file.getBytes()) {
                @Override public String getFilename() {
                    return file.getOriginalFilename();
                }
            });

            HttpEntity<LinkedMultiValueMap<String, Object>> req = new HttpEntity<>(body, headers);
            ResponseEntity<byte[]> res = rest.postForEntity(
                    kfashionBaseUrl + "/predict", req, byte[].class);

            return ResponseEntity.status(res.getStatusCode())
                    .headers(res.getHeaders())
                    .body(res.getBody());

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(("proxy error: " + e.getMessage()).getBytes());
        }
    }
}
