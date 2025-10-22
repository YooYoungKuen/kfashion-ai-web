// ======================================================
// REVIA Header (Luxury Edition - Login Left Version)
// - 로고 옆 로그인/로그아웃 버튼
// - 고정형 글라스 헤더 + 프리미엄 토글
// - 햄버거 네비게이션 (오른쪽)
// ======================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({ theme, toggleTheme, isLoggedIn, handleLogout }) {
  // ---------------- STATE ----------------
  const [menuOpen, setMenuOpen] = useState(false);

  // ---------------- HANDLERS ----------------
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLinkClick = () => setMenuOpen(false);

  // ---------------- RENDER ----------------
  return (
    <>
      {/* =====================================================
          HEADER BAR
      ===================================================== */}
      <header className="header">
        <div className="header-left">
          {/* ---------- LOGO ---------- */}
          <Link to="/" className="header-logo" onClick={handleLinkClick}>
            REVIA
          </Link>

          {/* ---------- LOGIN / LOGOUT ---------- */}
          {!isLoggedIn ? (
            <Link to="/login" className="header-login" onClick={handleLinkClick}>
              로그인
            </Link>
          ) : (
            <button className="header-logout" onClick={handleLogout}>
              로그아웃
            </button>
          )}
        </div>

        {/* ---------- RIGHT BUTTONS ---------- */}
        <div className="header-right">
          {/* 💎 THEME TOGGLE */}
          <button
            className={`lux-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            <div className="lux-circle" />
          </button>

          {/* 🍔 HAMBURGER */}
          <button
            className={`menu-toggle ${menuOpen ? "active" : ""}`}
            onClick={toggleMenu}
            aria-label="메뉴 열기"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </header>

      {/* =====================================================
          OVERLAY
      ===================================================== */}
      {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <nav className={`header-nav ${menuOpen ? "open" : ""}`}>
        <ul>
          <li>
            <Link to="/recommend" onClick={handleLinkClick}>
              코디추천
            </Link>
          </li>
          <li>
            <Link to="/style" onClick={handleLinkClick}>
              AI 스타일 분석
            </Link>
          </li>
          <li>
            <Link to="/help" onClick={handleLinkClick}>
              고객센터
            </Link>
          </li>
          <li>
            <Link to="/userpage" onClick={handleLinkClick}>
              마이페이지
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
