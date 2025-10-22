// ======================================================
// REVIA App — Email Verification Edition (완성본)
// ======================================================

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
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

  const [user, setUser] = useState({
    isLoggedIn: false,
    emailVerified: false,
  });

  // 🔹 로그인 상태 복원
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (stored) setUser(stored);
  }, []);

  // 🔹 로그인 / 로그아웃 처리
  const handleLogin = (emailVerified = false) => {
    const newUser = { isLoggedIn: true, emailVerified };
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser({ isLoggedIn: false, emailVerified: false });
  };

  // 🔹 보호 라우트
  function ProtectedRoute({ children }) {
    const location = useLocation();

    if (!user.isLoggedIn) {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (!user.emailVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    return children;
  }

  return (
    <Router>
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        isLoggedIn={user.isLoggedIn}
        handleLogout={handleLogout}
      />

      <Routes>
        {/* 공개 */}
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Help />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/change-password" element={<ChangePassword />} />

        {/* 보호 */}
        <Route
          path="/recommend"
          element={
            <ProtectedRoute>
              <Recommend />
            </ProtectedRoute>
          }
        />
        <Route
          path="/style"
          element={
            <ProtectedRoute>
              <Style />
            </ProtectedRoute>
          }
        />
        <Route
          path="/userpage"
          element={
            <ProtectedRoute>
              <UserPage />
            </ProtectedRoute>
          }
        />

        {/* 없는 경로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
