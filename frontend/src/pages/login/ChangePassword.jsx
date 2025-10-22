// ======================================================
// REVIA ChangePassword — 이메일 인증번호 기반 비밀번호 변경
// ======================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function ChangePassword() {
  const navigate = useNavigate();

  // 단계 제어: 1=이메일 입력, 2=OTP 입력 + 새 비번 입력
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 인증번호 전송
  const sendOtp = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/send-reset-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("인증번호 전송 실패");

      const data = await res.json();
      setServerOtp(data.otp); // ⚠️ 개발용 (실제 배포 시 서버 비교)
      setStep(2);
      alert("이메일로 인증번호를 전송했습니다.");
    } catch (err) {
      setError(err.message || "인증번호 전송 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!otp || otp !== serverOtp) {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!res.ok) throw new Error("비밀번호 변경 실패");

      alert("비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.");
      navigate("/login");
    } catch (err) {
      setError(err.message || "비밀번호 변경 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h2>비밀번호 변경</h2>

        {step === 1 && (
          <form onSubmit={sendOtp}>
            <input
              type="email"
              placeholder="가입된 이메일 주소"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "전송 중..." : "인증번호 전송"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleChangePassword}>
            <input
              type="text"
              placeholder="이메일로 받은 인증번호 입력"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="새 비밀번호 입력"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            {error && <p className="login-error">{error}</p>}
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? "변경 중..." : "비밀번호 변경 완료"}
            </button>
          </form>
        )}

        <p className="login-tip">
          <Link to="/login">로그인으로 돌아가기</Link>
        </p>
      </div>
    </div>
  );
}
