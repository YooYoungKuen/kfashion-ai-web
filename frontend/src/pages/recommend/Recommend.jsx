import React, { useState, useRef } from "react";
import axios from "axios";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import "./Recommend.css";

export default function Recommend() {
  const [gender, setGender] = useState("male");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [generatedResults, setGeneratedResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [platform, setPlatform] = useState("naver");

  const [cropImage, setCropImage] = useState(null);
  const [cropping, setCropping] = useState(false);
  const cropperRef = useRef(null);

  /* ================== 📸 이미지 처리 ================== */
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCropImage(url);
    setCropping(true);
    setResult(null);
    setGeneratedResults([]);
  };

  const handleCropComplete = () => {
    const cropper = cropperRef.current;
    if (!cropper) return alert("❌ Cropper 초기화 실패");
    const canvas = cropper.getCanvas();
    if (canvas) {
      const base64 = canvas.toDataURL("image/jpeg");
      setPreview(base64);
      canvas.toBlob(
        (blob) => {
          setImage(blob);
          setCropping(false);
        },
        "image/jpeg",
        1
      );
    }
  };

  /* ================== 🎨 색상+의류 토큰 ================== */
  const COLOR_WORDS =
    "블랙|화이트|카멜|브라운|그레이|네이비|블루|아이보리|베이지|핑크|레드|그린|카키|올리브|실버|골드|버건디|크림|라이트 블루|다크 블루";
  const GARMENT_WORDS =
    "트렌치코트|코트|자켓|셔츠|슬랙스|진|팬츠|니트|스웨터|가디건|부츠|첼시부츠|로퍼|운동화|벨트|스카프|시계|타이|모자";

  const normalizeSpaces = (s) =>
    (s || "").replace(/\s+/g, " ").replace(/색 의/g, "색의").trim();

  const extractColorGarmentTokens = (text) => {
    const src = normalizeSpaces(text);
    const pattern = new RegExp(
      `((?:${COLOR_WORDS})(?:색)?(?:\\s+[가-힣A-Za-z]+){0,2})\\s+(${GARMENT_WORDS})`,
      "g"
    );
    const tokens = [];
    let lastIndex = 0;
    let m;
    while ((m = pattern.exec(src)) !== null) {
      if (m.index > lastIndex) {
        const before = src.slice(lastIndex, m.index).trim();
        if (before)
          tokens.push(
            ...before.split(/[\s,]+/).map((t) => ({ text: t, merged: false }))
          );
      }
      tokens.push({ text: `${m[1]} ${m[2]}`, merged: true });
      lastIndex = pattern.lastIndex;
    }
    const tail = src.slice(lastIndex).trim();
    if (tail)
      tokens.push(
        ...tail.split(/[\s,]+/).map((t) => ({ text: t, merged: false }))
      );
    return tokens;
  };

  const openShop = (keyword, siteOverride) => {
    if (!keyword) return;
    const site = siteOverride || platform;
    const query = encodeURIComponent(keyword);
    const url =
      site === "musinsa"
        ? `https://www.musinsa.com/search/musinsa?q=${query}`
        : `https://search.shopping.naver.com/search/all?query=${query}`;
    window.open(url, "_blank");
  };

  const TokenLinks = ({ text }) => {
    const tokens = extractColorGarmentTokens(text);
    return (
      <>
        {tokens.map((tk, i) => (
          <span
            key={`${tk.text}-${i}`}
            className="clickable-text"
            onClick={() => openShop(tk.text)}
          >
            {tk.text}
            {i < tokens.length - 1 && " "}
          </span>
        ))}
      </>
    );
  };

  /* ================== 🤖 AI 분석 + 이미지 생성 ================== */
  const analyzeItem = async () => {
    if (!image) return alert("📸 이미지를 업로드해주세요.");
    setLoading(true);
    setGeneratedResults([]);
    setLoadingText("AI가 전체 착장을 분석 중...");

    try {
      const formData = new FormData();
      formData.append("file", image);
      formData.append("gender", gender);

      const res = await axios.post(
        "http://localhost:8081/api/fashion/analyze-item",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      setResult(res.data);

      // ✅ 미리 로딩 카드 추가 (화면 피드백용)
      setGeneratedResults([
        { tag: "메인 코디", loading: true },
        { tag: "색상 변형", loading: true },
        { tag: "대체 스타일", loading: true },
      ]);

      const variants = [
        { tag: "메인 코디", mood: "기본 착장" },
        { tag: "색상 변형", mood: "다른 색조와 대비" },
        { tag: "대체 스타일", mood: "새로운 분위기와 포즈" },
      ];

      const newResults = [];
      for (let i = 0; i < variants.length; i++) {
        setLoadingText(`🎨 AI가 ${variants[i].tag}를 생성 중...`);

        const outfitRes = await axios.post(
          "http://localhost:8081/api/fashion/generate-outfit",
          {
            gender: res.data.gender,
            title: `${res.data.mainItem} - ${variants[i].tag}`,
            matchTip: `${res.data.outfitSet?.top || ""}, ${res.data.outfitSet?.bottom || ""}`,
            colorTip: `${res.data.outfitSet?.colorTip || ""} | ${variants[i].mood}`,
            accessoryTip: Array.isArray(res.data.outfitSet?.accessories)
              ? res.data.outfitSet.accessories.join(", ")
              : "",
          }
        );

        const url = outfitRes.data?.imageUrl;
        if (url) {
          newResults.push({
            url,
            tag: variants[i].tag,
            magazine:
              i === 0
                ? res.data.magazine
                : i === 1
                ? res.data.magazine + "\n\n컬러톤이 달라진 버전입니다."
                : res.data.magazine + "\n\n다른 분위기의 코디입니다.",
            mainItem: res.data.mainItem,
            outfitSet: res.data.outfitSet,
          });

          // ✅ 생성된 이미지가 생길 때마다 화면 갱신
          setGeneratedResults((prev) => {
            const updated = [...prev];
            updated[i] = newResults[i];
            return updated;
          });
        }
      }
      setSelectedIndex(0);
    } catch (err) {
      console.error(err);
      alert("❌ AI 분석 오류 발생");
    } finally {
      setLoading(false);
      setLoadingText("");
    }
  };

  const currentData =
    generatedResults.length > 0 ? generatedResults[selectedIndex] : result;

  const outfitList = currentData?.outfitSet
    ? [
        { key: "top", label: "상의", value: currentData.outfitSet.top },
        { key: "bottom", label: "하의", value: currentData.outfitSet.bottom },
        { key: "outer", label: "아우터", value: currentData.outfitSet.outer },
        { key: "shoes", label: "신발", value: currentData.outfitSet.shoes },
        { key: "accessories", label: "악세사리", value: currentData.outfitSet.accessories },
      ]
    : [];

  /* ================== 렌더링 ================== */
  return (
    <div className="recommend">
      <div className="recommend-inner glass">
        <h1 className="title">REVIA AI Fashion Studio</h1>
        <p className="desc">AI가 당신의 옷을 분석하고 어울리는 전신 코디를 구성합니다.</p>

        {/* 성별 */}
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

        {/* 업로드 */}
        <label className="upload-box glass">
          {preview ? (
            <img src={preview} alt="preview" className="preview-img" />
          ) : (
            <span>📷 이미지 업로드</span>
          )}
          <input type="file" accept="image/*" onChange={handleImage} style={{ display: "none" }} />
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

        {/* 결과 표시 */}
        {result && (
          <div className="result-box glass">
            <div className="result-flex two-col">
              {/* 왼쪽 — 결과 카드 or 로딩 카드 */}
              <div className="left-stack">
                {generatedResults.map((item, idx) =>
                  item.loading ? (
                    <div key={idx} className="gen-loading glass shimmer">
                      <div className="loading-circle"></div>
                      <p>🎨 {item.tag} 생성 중...</p>
                    </div>
                  ) : (
                    <div
                      key={idx}
                      className={`gen-card fade-in ${selectedIndex === idx ? "selected" : ""}`}
                      onClick={() => setSelectedIndex(idx)}
                      style={{
                        cursor: "pointer",
                        border: selectedIndex === idx ? "2px solid var(--accent)" : "none",
                      }}
                    >
                      <img src={item.url} alt={`AI Outfit ${idx + 1}`} />
                      <p className="card-label">{item.tag}</p>
                    </div>
                  )
                )}
              </div>

              {/* 오른쪽 정보 */}
              <div className="result-text">
                <h3>| 매거진 |</h3><br></br>
                <p className="magazine">{currentData?.magazine}</p><br></br><br></br>

                <h3>| 메인 아이템 |</h3><br></br>
                <p className="main-item">{currentData?.mainItem}</p><br></br><br></br>

                <h3>| 착장 조합 추천 |</h3><br></br>
                <div className="platform-btns" style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                  <button
                    className={`link-btn naver ${platform === "naver" ? "active" : ""}`}
                    onClick={() => setPlatform("naver")}
                  >
                    네이버
                  </button>
                  <button
                    className={`link-btn musinsa ${platform === "musinsa" ? "active" : ""}`}
                    onClick={() => setPlatform("musinsa")}
                  >
                    무신사
                  </button>
                </div><br></br>

                <ul className="outfit-list clickable">
                  {outfitList.map((item) => {
                    const text = Array.isArray(item.value)
                      ? item.value.join(" ")
                      : normalizeSpaces(item.value);
                    return (
                      <li key={item.key}>
                        <strong>{item.label}:</strong>{" "}
                        <span className="item-text">
                          <TokenLinks text={text} />
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✂️ 자르기 모달 */}
      {cropping && (
        <div className="crop-modal">
          <div className="crop-container glass">
            <Cropper
              ref={cropperRef}
              src={cropImage}
              className="advanced-cropper"
              stencilProps={{
                movable: true,
                resizable: true,
                aspectRatio: 0,
                lines: true,
                handlers: true,
              }}
            />
            <div className="crop-controls">
              <button onClick={handleCropComplete}>자르기 완료</button>
              <button onClick={() => setCropping(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
