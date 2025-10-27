// ======================================================
// REVIA App — No Login Edition (로그인 기능 비활성화 완성본)
// ======================================================
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🔹 공용 컴포넌트
import Header from "./components/Header";

// 🔹 주요 페이지
import Home from "./pages/home/Home";
import Recommend from "./pages/recommend/Recommend";
import Style from "./pages/style/Style";
import Help from "./pages/help/Help";
import UserPage from "./pages/userpage/UserPage";

// 🔹 로그인 관련 (현재 비활성화)
import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import ChangePassword from "./pages/login/ChangePassword";

// 🔹 OpenAI / API 검색 페이지
import DataSearch from "./pages/data/DataSearch";

import "./App.css";

export default function App({ theme, setTheme }) {
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Router>
      {/* 헤더 */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={false} // 로그인 기능 비활성화
        handleLogout={() => {}}
      />

      {/* 라우팅 */}
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/recommend" element={<Recommend />} />
  <Route path="/style" element={<Style />} />
  <Route path="/userpage" element={<UserPage />} />
  <Route path="/help" element={<Help />} />
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
  <Route path="/change-password" element={<ChangePassword />} />
  <Route path="/api-search" element={<DataSearch />} />
  <Route path="*" element={<Navigate to="/" replace />} />
</Routes>
    </Router>
  );
}
