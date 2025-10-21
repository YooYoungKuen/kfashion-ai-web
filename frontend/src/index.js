import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// ✅ 테마 제어를 위한 래퍼 컴포넌트
function ThemedApp() {
  const [theme, setTheme] = useState(() => {
    // 기본값: 저장된 값이 있으면 그걸로, 없으면 'dark'
    return localStorage.getItem("theme") || "dark";
  });

  // ✅ theme이 바뀔 때마다 body에 class 적용
  useEffect(() => {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  return <App theme={theme} setTheme={setTheme} />;
}

// ✅ 렌더링
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ThemedApp />
  </React.StrictMode>
);

// 퍼포먼스 측정
reportWebVitals();
