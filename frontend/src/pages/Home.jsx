import React, { useState } from "react";

function Home() {
  const [image, setImage] = useState(null);           // 업로드한 이미지 저장
  const [preview, setPreview] = useState(null);       // 미리보기 이미지
  const [result, setResult] = useState(null);         // 분석 결과
  const [loading, setLoading] = useState(false);      // 로딩 상태

  // 📸 파일 선택 시 실행
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result);       // Base64 데이터 저장
      setPreview(reader.result);     // 미리보기 설정
    };
    reader.readAsDataURL(file);      // Base64로 변환
  };

  // 🚀 분석 요청 함수
  const handleAnalyze = async () => {
    if (!image) {
      alert("이미지를 업로드해주세요!");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8081/api/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "상의",      // 테스트용 카테고리 (원하면 선택 기능도 추가 가능)
          imageBase64: image
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ 서버 응답:", data);
      setResult(data);
    } catch (error) {
      console.error("❌ 요청 중 오류:", error);
      alert("서버 연결 오류 또는 분석 실패");
    } finally {
      setLoading(false);
    }
  };

  // 🧹 초기화 버튼
  const handleReset = () => {
    setImage(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "Pretendard, sans-serif",
        textAlign: "center",
      }}
    >
      <h1>👕 AI 이미지 분석</h1>
      <p>사진을 업로드하면 AI가 색상, 디자인 스타일을 분석합니다.</p>

      {/* 📤 이미지 업로드 */}
      <div style={{ marginTop: "20px" }}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ marginBottom: "15px" }}
        />
      </div>

      {/* 미리보기 */}
      {preview && (
        <div style={{ marginTop: "15px" }}>
          <img
            src={preview}
            alt="미리보기"
            style={{
              width: "300px",
              height: "auto",
              borderRadius: "10px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          />
        </div>
      )}

      {/* 버튼 영역 */}
      <div style={{ marginTop: "20px" }}>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            backgroundColor: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          {loading ? "분석 중..." : "AI 분석하기"}
        </button>

        <button
          onClick={handleReset}
          style={{
            backgroundColor: "#999",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          초기화
        </button>
      </div>

      {/* 분석 결과 */}
      {result && (
        <div
          style={{
            marginTop: "30px",
            padding: "20px",
            backgroundColor: "#f9f9f9",
            borderRadius: "10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            width: "400px",
            margin: "30px auto",
            textAlign: "left",
          }}
        >
          <h3>📊 분석 결과</h3>
          <p><b>색상:</b> {result.color}</p>
          <p><b>디자인:</b> {result.design}</p>
          <p><b>패턴:</b> {result.pattern}</p>
          <p><b>스타일:</b> {result.style}</p>
          <p><b>키워드:</b> {result.keywords?.join(", ")}</p>
        </div>
      )}
    </div>
  );
}

export default Home;
