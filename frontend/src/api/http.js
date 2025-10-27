// ✅ axios 기본 설정 파일

import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:8081", // Spring Boot 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
});

export default http;
