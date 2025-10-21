import React, { useState, useEffect } from "react";
import "./UserPage.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function UserPage() {
  const [theme, setTheme] = useState(document.body.classList.contains("dark") ? "dark" : "light");

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.body.classList.contains("dark") ? "dark" : "light";
      setTheme(currentTheme);
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const [user, setUser] = useState({
    name: "홍길동",
    email: "revia_user@email.com",
    joined: "2025-10-01",
    profileImg: "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  });

  const [editMode, setEditMode] = useState(false);
  const [tempName, setTempName] = useState(user.name);

  const handleEdit = () => {
    if (editMode) setUser({ ...user, name: tempName });
    setEditMode(!editMode);
  };

  const recommendations = [
    { id: 1, title: "가을 무드 데일리룩", img: "https://cdn.pixabay.com/photo/2016/11/29/13/01/fashion-1866578_1280.jpg" },
    { id: 2, title: "화이트 셔츠 미니멀룩", img: "https://cdn.pixabay.com/photo/2017/06/10/07/18/fashion-2388474_1280.jpg" },
    { id: 3, title: "스트릿 감성 캐주얼", img: "https://cdn.pixabay.com/photo/2016/03/27/21/16/man-1282232_1280.jpg" },
  ];

  // 스타일 취향 비율 (PieChart)
  const styleData = [
    { name: "미니멀", value: 40 },
    { name: "스트릿", value: 25 },
    { name: "캐주얼", value: 20 },
    { name: "페미닌", value: 15 },
  ];

  // 연도별 스타일 트렌드 (BarChart)
  const trendData = [
    { year: "2022", 미니멀: 30, 스트릿: 25, 캐주얼: 25, 페미닌: 20 },
    { year: "2023", 미니멀: 35, 스트릿: 30, 캐주얼: 25, 페미닌: 10 },
    { year: "2024", 미니멀: 40, 스트릿: 25, 캐주얼: 20, 페미닌: 15 },
    { year: "2025", 미니멀: 45, 스트릿: 20, 캐주얼: 25, 페미닌: 10 },
  ];

  const COLORS =
    theme === "dark"
      ? ["#8a66ff", "#9d7bff", "#b49cff", "#d5c6ff"]
      : ["#6c63ff", "#9c8eff", "#b8b2ff", "#e4e0ff"];

  return (
    <section className="userpage">
      <div className="userpage-inner">
        <h1>
          마이페이지 <span>REVIA</span>
        </h1>
        <p className="desc">내 프로필을 관리하고, AI 분석 및 추천 내역을 확인하세요.</p>

        {/* 프로필 */}
        <div className="profile-card">
          <div className="profile-top">
            <img src={user.profileImg} alt="프로필" className="profile-img" />
            <div className="profile-info">
              {editMode ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="edit-input"
                />
              ) : (
                <h2>{user.name}</h2>
              )}
              <p>{user.email}</p>
              <p className="joined">가입일: {user.joined}</p>
              <button className="edit-btn" onClick={handleEdit}>
                {editMode ? "저장" : "수정"}
              </button>
            </div>
          </div>
        </div>

        {/* AI 추천 히스토리 */}
        <div className="recommend-history">
          <h2>AI 추천 히스토리</h2>
          <div className="recommend-grid">
            {recommendations.map((item) => (
              <div className="recommend-card" key={item.id}>
                <img src={item.img} alt={item.title} />
                <h3>{item.title}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* 📊 AI 스타일 분석 통계 */}
        <div className="style-chart-section">
          <h2>AI 스타일 분석 통계</h2>
          <p className="chart-desc">나의 스타일 취향 비율과 연도별 변화를 한눈에.</p>

          {/* Pie Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={styleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {styleData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === "dark" ? "#1c1c1c" : "#fff",
                    color: theme === "dark" ? "#fff" : "#000",
                    borderRadius: "8px",
                    border: "none",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trendData} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === "dark" ? "#444" : "#ccc"} />
                <XAxis dataKey="year" stroke={theme === "dark" ? "#ddd" : "#333"} />
                <YAxis stroke={theme === "dark" ? "#ddd" : "#333"} />
                <Tooltip />
                {Object.keys(trendData[0])
                  .filter((key) => key !== "year")
                  .map((style, i) => (
                    <Bar key={style} dataKey={style} fill={COLORS[i % COLORS.length]} />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
