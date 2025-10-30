// src/pages/style/Style.jsx
import { useMemo, useRef, useState } from "react";
import http from "../../api/http";
import { Cropper } from "react-advanced-cropper";
import "react-advanced-cropper/dist/style.css";
import "./Style.css";

const KEYS = ["category", "detail", "print", "style", "texture"];
const KEY_LABEL = {
  category: "카테고리",
  detail: "디테일",
  print: "프린트",
  style: "스타일",
  texture: "텍스처",
};

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
    if (k === "style") labels = labels.filter((n) => !/^style_\d+$/i.test(n));
    out[k] = Array.from(new Set(labels));
  });
  return out;
}

export default function Style() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [options, setOptions] = useState({});
  const [checked, setChecked] = useState({});

  const [cropImage, setCropImage] = useState(null);
  const [cropping, setCropping] = useState(false);
  const cropperRef = useRef(null);

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const openCropperWithFile = (f) => {
    if (!f) return;
    const url = URL.createObjectURL(f);
    setCropImage(url);
    setCropping(true);
    setFile(null);
    setPreview("");
    setResult(null);
    setOptions({});
    setChecked({});
  };

  const onFileChange = (e) => openCropperWithFile(e.target.files?.[0] || null);
  const onUploadBoxClick = () => fileInputRef.current?.click();

  const onDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    openCropperWithFile(e.dataTransfer.files?.[0] || null);
  };

  const handleCropComplete = () => {
    const cropper = cropperRef.current;
    if (!cropper || typeof cropper.getCanvas !== "function")
      return alert("❌ Cropper 초기화 실패");
    const canvas = cropper.getCanvas();
    if (!canvas) return alert("❌ 잘라낼 영역이 없습니다.");
    const base64 = canvas.toDataURL("image/jpeg");
    setPreview(base64);
    canvas.toBlob(
      (blob) => {
        if (!blob) return alert("❌ Blob 생성 실패");
        setFile(new File([blob], "crop.jpg", { type: "image/jpeg" }));
        setCropping(false);
        if (cropImage) URL.revokeObjectURL(cropImage);
        setCropImage(null);
      },
      "image/jpeg",
      0.95
    );
  };

  const cancelCropping = () => {
    setCropping(false);
    if (cropImage) URL.revokeObjectURL(cropImage);
    setCropImage(null);
  };

  const resetImage = () => {
    setFile(null);
    setPreview("");
    setResult(null);
    setOptions({});
    setChecked({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const onAnalyze = async () => {
    if (!file) return alert("이미지를 업로드하고 자르기 완료를 눌러주세요.");
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("gender", "female");
      const { data } = await http.post("/predict", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
      setOptions(normalizeOptions(data));
      setChecked({});
    } catch (err) {
      console.error(err);
      alert("분석 중 오류가 발생했습니다.");
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
      <div className="style-inner glass">
        <h1 className="title">REVIA AI Style Studio</h1>
        <p className="desc">AI가 카테고리·디테일·프린트·스타일·텍스처를 분석해 키워드로 정리합니다.</p>

        {!preview ? (
          <div
            className={`upload-box glass ${isDragOver ? "drag-over" : ""}`}
            onClick={onUploadBoxClick}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            <span>📷 이미지 업로드</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div className="preview-container">
            <img src={preview} alt="preview" className="preview-img" />
            <div className="preview-overlay">
              <div>{file?.name}</div>
              <button className="reset-btn" onClick={resetImage}>
                초기화
              </button>
            </div>
          </div>
        )}

        <button
          className={`analyze-btn ${loading ? "loading" : ""}`}
          onClick={onAnalyze}
          disabled={!file || loading}
        >
          {loading ? "분석 중..." : result ? "다시 분석하기" : "AI로 분석하기"}
        </button>

        {result && (
          <div className="result-box glass">
            {KEYS.map((k) => (
              <div key={k} className="group">
                <div className="group-title">{KEY_LABEL[k]}</div>
                <div className="chips">
                  {(options[k] || []).map((label, idx) => (
                    <label key={idx} className="chip modern">
                      <input
                        type="checkbox"
                        checked={checked[k]?.has(label) || false}
                        onChange={() => toggle(k, label)}
                      />
                      <span className="checkmark" />
                      <span className="chip-label">{label}</span>
                    </label>
                  ))}
                  {(options[k] || []).length === 0 && (
                    <span className="empty">예측 결과 없음</span>
                  )}
                </div>
              </div>
            ))}
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
              <button onClick={cancelCropping}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
