// ======================================================
// REVIA App — No Login Edition (로그인 기능 비활성화 버전 완성본)
// ======================================================

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Header from "./components/Header";
import Home from "./pages/home/Home";
import Recommend from "./pages/recommend/Recommend";
import Style from "./pages/style/Style";
import Help from "./pages/help/Help";
import UserPage from "./pages/userpage/UserPage";
import Login from "./pages/login/Login";
import Signup from "./pages/login/Signup";
import ChangePassword from "./pages/login/ChangePassword";

import "./App.css";

export default function App({ theme, setTheme }) {
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Router>
      {/* 헤더 */}
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={false}
        handleLogout={() => {}}
      />

      {/* 모든 페이지 공개 */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/style" element={<Style />} />
        <Route path="/userpage" element={<UserPage />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/change-password" element={<ChangePassword />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
