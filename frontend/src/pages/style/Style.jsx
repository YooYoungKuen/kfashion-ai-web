// src/pages/style/Style.jsx
import { useMemo, useRef, useState } from "react";
import http from "../../api/http";
import "./Style.css";

const KEYS = ["category", "detail", "print", "style", "texture"];
const KEY_LABEL = {
  category: "카테고리",
  detail: "디테일",
  print: "프린트",
  style: "스타일",
  texture: "텍스처",
};

// 응답 → 체크박스 옵션 정규화
function normalizeOptions(resp) {
  const out = {};
  const raw = resp?.raw ?? {};
  const attrs = Array.isArray(resp?.attributes) ? resp.attributes : [];

  KEYS.forEach((k) => {
    const rawArr = Array.isArray(raw[k]) ? raw[k] : [];
    let labels = rawArr
      .map((it) => (typeof it === "string" ? it : it?.label))
      .filter(Boolean);

    if (labels.length === 0) {
      const a = attrs.find((it) => it?.key === k && it?.label);
      if (a) labels = [a.label];
    }

    // 🔹 임시 우회: style_숫자 토큰은 숨김
    if (k === "style") {
      labels = labels.filter((name) => !/^style_\d+$/i.test(name));
    }

    // 중복 제거
    labels = Array.from(new Set(labels));

    out[k] = labels;
  });
  return out;
}

export default function Style() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({});
  const [checked, setChecked] = useState({}); // ❗️자동 체크 없음 (비워둠)

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const loadFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setOptions({});
    setChecked({});
  };

  const onFileChange = (e) => loadFile(e.target.files?.[0] || null);
  const onUploadBoxClick = () => fileInputRef.current?.click();

  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    loadFile(e.dataTransfer.files?.[0] || null);
  };

  const resetImage = () => {
    setFile(null); setPreview("");
    setResult(null); setOptions({}); setChecked({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onAnalyze = async () => {
    if (!file) return alert("이미지를 업로드하세요.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await http.post("/predict", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setOptions(normalizeOptions(data));
      // ❗️자동 체크 없음: 사용자가 직접 선택
      setChecked({});
      console.log("AI 응답:", data);
    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했습니다. 콘솔을 확인하세요.");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (k, label) => {
    setChecked((prev) => {
      const next = new Set(prev[k] || []);
      next.has(label) ? next.delete(label) : next.add(label);
      return { ...prev, [k]: next };
    });
  };

  const selectedKeywords = useMemo(() => {
    const all = [];
    KEYS.forEach((k) => (checked[k] ? all.push(...checked[k]) : null));
    return all;
  }, [checked]);

  return (
    <div className="style-page">
      <div className="style-inner">
        <h1>
          AI 스타일 분석
          <span>Style Analysis</span>
        </h1>

        <p className="style-desc">
          이미지를 업로드하면 AI가 색감 · 패턴 · 무드를 분석합니다.
        </p>

        {!preview ? (
          <div
            className="upload-box"
            onClick={onUploadBoxClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            style={{ outline: isDragOver ? "3px solid rgba(138,102,255,0.5)" : "none" }}
          >
            <div className="upload-label">
              <div className="upload-icon">📂</div>
              <div>이미지를 업로드하거나 이 영역에 끌어다 놓으세요</div>
              <span>PNG, JPG, JPEG (최대 10MB)</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={onFileChange} />
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="preview" className="preview-img" />
            <div className="preview-overlay">
              <div>{file?.name}</div>
              <button className="reset-btn" onClick={resetImage}>초기화</button>
            </div>
          </div>
        )}

        <div className="analyze-cta">
          <button className="analyze-btn" onClick={onAnalyze} disabled={!file || loading}>
            {loading ? "분석 중..." : (result ? "다시 분석하기" : "AI로 분석하기")}
          </button>
        </div>

        {result && (
          <div className="result-section">
            {KEYS.map((k) => (
              <div key={k} className="group">
                <div className="group-title">{KEY_LABEL[k]}</div>
                <div className="chips">
                  {(options[k] || []).map((label, idx) => (
                    <label key={idx} className="chip">
                      <input
                        type="checkbox"
                        checked={checked[k]?.has(label) || false}
                        onChange={() => toggle(k, label)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                  {(options[k] || []).length === 0 && (
                    <span className="empty">예측 결과 없음</span>
                  )}
                </div>
              </div>
            ))}

            <div className="selected">
              <div className="selected-title">선택된 키워드</div>
              <div className="selected-chips">
                {selectedKeywords.length > 0 ? (
                  selectedKeywords.map((kw, i) => <span key={i} className="badge">{kw}</span>)
                ) : (
                  <span className="empty">아직 선택된 키워드가 없습니다.</span>
                )}
              </div>
            </div>

            <div className="query">
              <div className="query-title">검색 쿼리(미리보기)</div>
              <code className="query-code">{selectedKeywords.join(" ")}</code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
