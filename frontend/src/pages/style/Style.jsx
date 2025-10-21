import React, { useState } from "react";
import "./Style.css";

export default function Style() {
  const [image, setImage] = useState(null);
  const [fileName, setFileName] = useState("");

  // ✅ 이미지 업로드
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setFileName(file.name);
  };

  // ✅ 초기화
  const handleReset = () => {
    setImage(null);
    setFileName("");
  };

  // ✅ 분석 (임시 기능: 콘솔 출력)
  const handleAnalyze = () => {
    if (!image) return alert("이미지를 먼저 업로드하세요!");
    console.log("분석 시작:", fileName);
    alert("AI 분석이 시작됩니다 (연결 준비 중)");
  };

  return (
    <div className="style-page">
      <div className="style-inner">
        <h1>
          AI 스타일 분석 <span>Style Analysis</span>
        </h1>
        <p className="style-desc">
          이미지를 업로드하면 AI가 색감・패턴・무드를 분석합니다.
        </p>

        {/* ✅ 업로드 박스 */}
        <div className={`upload-box ${image ? "has-image" : ""}`}>
          {!image ? (
            <>
              <label htmlFor="file-upload" className="upload-label">
                <div className="upload-icon">📷</div>
                <p>이미지를 업로드하거나 이 영역에 끌어다 놓으세요</p>
                <span>PNG, JPG, JPEG (최대 10MB)</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
            </>
          ) : (
            <div className="preview-container">
              <img src={image} alt="preview" className="preview-img" />
              <div className="preview-overlay">
                <p>{fileName}</p>
                <button onClick={handleReset} className="reset-btn">
                  ❌ 초기화
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ✅ AI 분석 버튼 */}
        {image && (
          <div className="analyze-cta">
            <button className="analyze-btn" onClick={handleAnalyze}>
              AI로 분석하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
