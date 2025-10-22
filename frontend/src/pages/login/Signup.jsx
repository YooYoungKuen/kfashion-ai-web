// ======================================================
// REVIA Signup — 이메일 인증번호 확인 포함 (Mock 완성본)
// ======================================================

import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

export default function Signup() {
  const navigate = useNavigate();

  // ---------------- STATE ----------------
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------------- OTP 전송 ----------------
  const sendOtp = async () => {
    if (!email) {
      setError("이메일을 입력해주세요.");
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ✅ 백엔드 없이 테스트용 (임시 mock)
      setTimeout(() => {
        const generatedOtp = "123456"; // 테스트용 인증번호
        setServerOtp(generatedOtp);
        setOtpSent(true);
        setLoading(false);
        alert(`테스트용 인증번호: ${generatedOtp}`);
      }, 800);

      // ✅ 백엔드 연결 시 (아래 주석 해제)
      /*
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("인증번호 전송 실패");
      const data = await res.json();
      setServerOtp(data.otp);
      setOtpSent(true);
      alert("이메일로 인증번호를 전송했습니다.");
      */
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- OTP 확인 ----------------
  const verifyOtp = async () => {
    if (!otpSent) {
      setError("먼저 인증번호를 전송해주세요.");
      return;
    }
    if (!otp) {
      setError("인증번호를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    // ✅ 프론트 mock 검증
    setTimeout(() => {
      if (otp === serverOtp) {
        setOtpVerified(true);
        alert("이메일 인증이 완료되었습니다.");
      } else {
        setError("인증번호가 일치하지 않습니다.");
      }
      setLoading(false);
    }, 600);

    // ✅ 백엔드 연결 시 (주석 해제)
    /*
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) {
      setError("인증번호가 일치하지 않습니다.");
      return;
    }
    setOtpVerified(true);
    */
  };

  // ---------------- 회원가입 완료 ----------------
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!otpVerified) {
      setError("이메일 인증을 완료해주세요.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // ✅ 프론트 mock 회원가입
      localStorage.setItem(
        "reviaUser",
        JSON.stringify({ email, password })
      );
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");

      // ✅ 백엔드 연결 시 (주석 해제)
      /*
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error("회원가입 실패");
      alert("회원가입이 완료되었습니다. 로그인해주세요.");
      navigate("/login");
      */
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>회원가입</h2>

        <form onSubmit={handleSignup}>
          {/* 이메일 + 인증번호 전송 */}
          <div className="signup-email-row">
            <input
              type="email"
              placeholder="이메일 입력"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={otpVerified}
            />
            <button
              type="button"
              className="otp-btn"
              onClick={sendOtp}
              disabled={loading || otpVerified}
            >
              {loading ? "전송 중..." : otpSent ? "재전송" : "인증번호 전송"}
            </button>
          </div>

          {/* 비밀번호 입력 */}
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={otpVerified}
          />
          <input
            type="password"
            placeholder="비밀번호 확인"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={otpVerified}
          />

          {/* 인증번호 입력 + 확인 버튼 */}
          {otpSent && !otpVerified && (
            <div className="signup-email-row">
              <input
                type="text"
                placeholder="이메일로 받은 인증번호 입력"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <button
                type="button"
                className="otp-btn"
                onClick={verifyOtp}
                disabled={loading}
              >
                인증 확인
              </button>
            </div>
          )}

          {error && <p className="login-error">{error}</p>}

          {/* 회원가입 완료 */}
          <button
            className="login-btn"
            type="submit"
            disabled={loading || !otpVerified}
          >
            {loading ? "가입 중..." : "회원가입 완료"}
          </button>
        </form>

        <p className="login-tip">
          이미 계정이 있으신가요? <Link to="/login">로그인</Link>
        </p>
      </div>
    </div>
  );
}
