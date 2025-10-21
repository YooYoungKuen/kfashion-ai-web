// ======================================================
// REVIA Header
// - 프리미엄 메탈 글라스 테마 토글
// - Apple 감성 고정 헤더
// - 부드러운 햄버거 모션
// ======================================================

import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({ theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  // 메뉴 토글
  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <>
      {/* ---------------- HEADER ---------------- */}
      <header className="header">
        {/* 로고 */}
        <Link
          to="/"
          className="header-logo"
          onClick={handleLinkClick}
        >
          REVIA
        </Link>

        {/* 우측 버튼 그룹 */}
        <div className="header-right">
          {/* 💎 프리미엄 테마 토글 */}
          <button
            className={`lux-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            <div className="lux-circle" />
          </button>

          {/* 🍔 햄버거 버튼 */}
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

      {/* ---------------- OVERLAY ---------------- */}
      {menuOpen && (
        <div
          className="menu-overlay"
          onClick={toggleMenu}
        ></div>
      )}

      {/* ---------------- NAVIGATION ---------------- */}
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
