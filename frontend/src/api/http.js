// src/api/http.js
import axios from "axios";

const http = axios.create({
  baseURL: "http://127.0.0.1:8001", // FastAPI 서버
  withCredentials: false,           // 쿠키 인증 안쓰면 false
});

export default http;
