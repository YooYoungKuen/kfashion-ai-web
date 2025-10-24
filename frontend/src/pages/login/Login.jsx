// ======================================================
// REVIA Login Page — UI Only (No Login Logic)
// ======================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("현재 로그인 기능은 비활성화되어 있습니다.");
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
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="비밀번호"
            value={form.password}
            onChange={handleChange}
            required
          />

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
