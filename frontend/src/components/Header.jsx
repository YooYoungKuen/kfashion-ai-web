// ======================================================
// REVIA Header — Luxury Edition (API 검색 포함 완성본)
// ======================================================
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Header.css";

export default function Header({ theme, toggleTheme, isLoggedIn, handleLogout }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const handleLinkClick = () => setMenuOpen(false);

  return (
    <>
      {/* ===== 헤더 상단 ===== */}
      <header className="header">
        {/* 좌측 로고 + 로그인 */}
        <div className="header-left">
          <Link to="/" className="header-logo" onClick={handleLinkClick}>
            REVIA
          </Link>

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

        {/* 우측 테마 토글 + 메뉴 버튼 */}
        <div className="header-right">
          <button
            className={`lux-toggle ${theme}`}
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            <div className="lux-circle" />
          </button>

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

      {/* ===== 메뉴 오버레이 ===== */}
      {menuOpen && <div className="menu-overlay" onClick={toggleMenu}></div>}

      {/* ===== 내비게이션 메뉴 ===== */}
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
            <Link to="/userpage" onClick={handleLinkClick}>
              AI챗
            </Link>
          </li>
           <li>
            <Link to="/chatbot" onClick={handleLinkClick}>
              마이페이지
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
