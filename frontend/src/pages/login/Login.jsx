// ======================================================
// REVIA Login Page — Glass & Luxury Tone 완성본
// ======================================================

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 로컬스토리지에 저장된 유저 정보 확인 (임시 로그인 로직)
    const user = JSON.parse(localStorage.getItem("reviaUser"));

    if (!user || user.email !== form.email || user.password !== form.password) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    onLogin(); // 상위(App.js) 상태 갱신
    navigate("/"); // 로그인 후 홈으로 이동
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>REVIA 로그인</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="이메일"
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            onChange={handleChange}
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit">
            로그인
          </button>
        </form>

        <p className="login-tip">
          계정이 없으신가요?{" "}
          <Link to="/signup" className="link-accent">
            회원가입
          </Link>
          <br />
          비밀번호를 잊으셨나요?{" "}
          <Link to="/change-password" className="link-accent">
            비밀번호 변경
          </Link>
        </p>
      </div>
    </div>
  );
}
