import React from "react";
import Header from "./components/Header";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import Recommend from "./pages/recommend/Recommend";
import Style from "./pages/style/Style";
import Help from "./pages/help/Help";
import UserPage from "./pages/userpage/UserPage";
import "./App.css";

export default function App({ theme, setTheme }) {
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Router>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/style" element={<Style />} />
        <Route path="/help" element={<Help />} />
        <Route path="/userpage" element={<UserPage />} /> {/* ✅ 변경 */}
      </Routes>
    </Router>
  );
}
