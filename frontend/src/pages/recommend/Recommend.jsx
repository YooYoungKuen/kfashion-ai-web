import React, { useState } from "react";
import "./Recommend.css";

export default function Recommend() {
  // 사용자 선택값 저장
  const [preferences, setPreferences] = useState({
    color: "",
    style: "",
    mood: "",
  });
  const [generatedImage, setGeneratedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // 옵션 데이터
  const colorOptions = ["화이트", "블랙", "베이지", "네이비", "파스텔"];
  const styleOptions = ["미니멀", "스트릿", "오피스룩", "캐주얼", "페미닌"];
  const moodOptions = ["모던", "빈티지", "시크", "러블리", "댄디"];

  // 클릭 시 선택 상태 업데이트
  const handleSelect = (category, value) => {
    setPreferences((prev) => ({ ...prev, [category]: value }));
  };

  // AI 이미지 생성 (임시 예시용)
  const generateImage = async () => {
    setLoading(true);
    setGeneratedImage(null);

    // 실제 AI 연동 부분은 백엔드 (Spring Boot + OpenAI API)로 연결됨
    // 여기는 임시 placeholder 이미지
    setTimeout(() => {
      setGeneratedImage(
        "https://images.unsplash.com/photo-1593032457869-6a6f9e60d7d1?auto=format&fit=crop&w=1000&q=80"
      );
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="recommend">
      <div className="recommend-inner">
        <h1>
          나만의 <span>AI 코디 추천</span>
        </h1>
        <p className="desc">
          아래 항목을 선택하면 REVIA가 당신의 취향을 학습해 스타일을 시각화합니다.
        </p>

        {/* 질문 폼 */}
        <div className="recommend-form">
          <div className="form-group">
            <h3>1️⃣ 어떤 색상을 가장 좋아하시나요?</h3>
            <div className="option-row">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  className={`option-btn ${
                    preferences.color === color ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("color", color)}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <h3>2️⃣ 평소 즐겨 입는 스타일은?</h3>
            <div className="option-row">
              {styleOptions.map((style) => (
                <button
                  key={style}
                  className={`option-btn ${
                    preferences.style === style ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("style", style)}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <h3>3️⃣ 선호하는 분위기를 골라주세요</h3>
            <div className="option-row">
              {moodOptions.map((mood) => (
                <button
                  key={mood}
                  className={`option-btn ${
                    preferences.mood === mood ? "selected" : ""
                  }`}
                  onClick={() => handleSelect("mood", mood)}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* 이미지 생성 버튼 */}
          <div className="form-generate">
            <button
              className="btn generate-btn"
              onClick={generateImage}
              disabled={loading}
            >
              {loading ? "AI가 스타일 생성 중..." : "AI 코디 이미지 생성하기"}
            </button>
          </div>
        </div>

        {/* 결과 이미지 표시 */}
        <div className="recommend-result">
          {loading && <p className="loading">✨ 스타일을 분석 중입니다...</p>}
          {generatedImage && (
            <div className="result-box">
              <img src={generatedImage} alt="AI Style" />
              <p className="result-desc">
                {preferences.color}, {preferences.style}, {preferences.mood} 감성을
                반영한 AI 스타일입니다.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
