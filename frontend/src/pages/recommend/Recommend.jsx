import React, { useState } from "react";
import axios from "axios";
import "./Recommend.css";

export default function Recommend() {
  const [gender, setGender] = useState("male");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [outfit, setOutfit] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setOutfit("");
  };

  const analyzeItem = async () => {
    if (!image) return alert("📸 이미지를 업로드해주세요.");
    setLoading(true);
    setLoadingText("AI가 옷의 색상과 핏을 분석 중...");

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("gender", gender);

      const res = await axios.post("http://localhost:8081/api/fashion/analyze-item", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(res.data);
      setLoadingText("AI가 전신 착장을 구성 중...");

      const outfitRes = await axios.post("http://localhost:8081/api/fashion/generate-outfit", {
        gender: res.data.gender,
        color: res.data.color,
        design: res.data.design,
        style: res.data.style,
      });

      setOutfit(outfitRes.data.imageUrl);
    } catch (err) {
      console.error(err);
      alert("❌ AI 분석 중 오류 발생");
    } finally {
      setLoading(false);
    }
  };

  /** 🛍️ 통합 쇼핑 버튼 클릭 시 */
  const openShop = (site, keywords = []) => {
    if (!keywords.length) return;
    const query = encodeURIComponent(keywords.join(" "));
    if (site === "musinsa") {
      window.open(`https://www.musinsa.com/search/musinsa?q=${query}`, "_blank");
    } else {
      window.open(`https://search.shopping.naver.com/search/all?query=${query}`, "_blank");
    }
  };

  return (
    <div className="recommend">
      <div className="recommend-inner">
        <h1>REVIA AI Fashion Studio</h1>
        <p className="desc">AI가 당신의 옷을 분석하고 어울리는 전신 코디를 구성합니다.</p>

        {/* 성별 선택 */}
        <div className="gender-toggle">
          <button
            className={`gender-btn ${gender === "male" ? "active" : ""}`}
            onClick={() => setGender("male")}
          >
            남성
          </button>
          <button
            className={`gender-btn ${gender === "female" ? "active" : ""}`}
            onClick={() => setGender("female")}
          >
            여성
          </button>
        </div>

        {/* 이미지 업로드 */}
        <label className="upload-box">
          {preview ? (
            <img src={preview} alt="preview" className="preview-img" />
          ) : (
            <span>📷 이미지 업로드</span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            style={{ display: "none" }}
          />
        </label>

        {/* 분석 버튼 */}
        <button
          onClick={analyzeItem}
          className={`generate-btn ${loading ? "loading" : ""}`}
          disabled={loading}
        >
          {loading ? (
            <div className="btn-loading">
              <div className="spinner"></div>
              <span>{loadingText}</span>
            </div>
          ) : (
            "AI 코디 분석하기"
          )}
        </button>

        {/* 결과 */}
        {result && (
          <div className="result-box" style={{ display: "flex", gap: "25px", alignItems: "flex-start" }}>
            {/* 왼쪽: 이미지 */}
            <div style={{ flex: 1, textAlign: "center" }}>
              {outfit ? (
                <img src={outfit} alt="AI Outfit" className="ai-image" />
              ) : (
                <div className="loader-ring">
                  <div className="ring"></div>
                  <p>전신 착장 생성 중...</p>
                </div>
              )}
            </div>

            {/* 오른쪽: 분석 텍스트 */}
            <div style={{ flex: 1 }}>
              <h3>📰 매거진</h3>
              <div className="magazine-text">{result.magazine}</div>

              <h3>🎨 스타일 요약</h3>
              <div className="magazine-text secondary">{result.style}</div>

              <h3>🛍️ 쇼핑 검색</h3>
              {result.keywords && result.keywords.length > 0 ? (
                <div style={{ marginTop: "10px" }}>
                  <button
                    className="image-btn"
                    onClick={() => openShop("musinsa", result.keywords)}
                  >
                    무신사에서 전체 검색
                  </button>
                  <button
                    className="image-btn"
                    onClick={() => openShop("naver", result.keywords)}
                    style={{ marginLeft: "10px" }}
                  >
                    네이버쇼핑에서 전체 검색
                  </button>
                  <div
                    style={{
                      marginTop: "10px",
                      fontSize: "0.95rem",
                      color: "var(--text-sub)",
                    }}
                  >
                    🔖 검색 키워드: {result.keywords.join(", ")}
                  </div>
                </div>
              ) : (
                <p style={{ color: "gray" }}>키워드 없음</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
