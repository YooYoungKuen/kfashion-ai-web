from typing import Dict, Any, List
import os
import json
import numpy as np
import torch
import torch.nn as nn
from PIL import Image

# =========================
# 경로/상수
# =========================
ROOT_DIR = os.path.dirname(os.path.dirname(__file__))              # .../app
MODEL_ROOT = os.path.join(ROOT_DIR, "kfashion_ai_model")
CKPT = {
    "category": os.path.join(MODEL_ROOT, "checkpoint", "kfashion_category", "model_category_best.pth.tar"),
    "detail":   os.path.join(MODEL_ROOT, "checkpoint", "kfashion_detail",   "model_detail_best.pth.tar"),
    "print":    os.path.join(MODEL_ROOT, "checkpoint", "kfashion_print",    "model_print_best.pth.tar"),
    "style":    os.path.join(MODEL_ROOT, "checkpoint", "kfashion_style",    "model_best.pth.tar"),
    "texture":  os.path.join(MODEL_ROOT, "checkpoint", "kfashion_texture",  "model_texture_best.pth.tar"),
}
DATA_DIR = os.path.join(MODEL_ROOT, "data")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# 클래스 수(검증 결과 반영)
NUM_CLASSES = {
    "category": 21,
    "detail":   40,
    "print":    21,
    "style":    23,
    "texture":  27,
}

# 전역 캐시
MODELS: Dict[str, nn.Module] = {}
LABEL_MAPS: Dict[str, List[str]] = {}


# =========================
# 안전 임포트 (커스텀 -> 표준 -> torchvision 폴백)
# =========================
def safe_imports():
    backbone = None
    # 1) 커스텀 resnet_c (AI-Hub 구조: downsample.1이 Conv)
    try:
        from app.kfashion_ai_model.utility.resnet_c import resnet50 as resnet50_c  # type: ignore
        backbone = ("resnet_c", resnet50_c)
    except Exception:
        backbone = None

    # 2) 폴백: utility.resnet
    if backbone is None:
        try:
            from app.kfashion_ai_model.utility.resnet import resnet50 as resnet50_std  # type: ignore
            backbone = ("resnet_std", resnet50_std)
        except Exception:
            backbone = None

    # 3) 최후 폴백: torchvision
    if backbone is None:
        from torchvision.models import resnet50 as tv_resnet50
        backbone = ("torchvision", tv_resnet50)

    return backbone  # ("name", ctor)


# =========================
# 모델 빌더
# =========================
def build_model(variant: str) -> nn.Module:
    num_classes = NUM_CLASSES[variant]
    name, ctor = safe_imports()

    # style도 우선 동일 백본으로 시도(체크포인트에 맞는 키만 로드하므로 안전)
    try:
        m = ctor(num_classes=num_classes)  # 커스텀 구현이 num_classes 인자를 받으면 그대로 사용
    except TypeError:
        # 일부 구현은 num_classes 인자가 없음 → fc를 직접 교체
        m = ctor()
        if hasattr(m, "fc") and isinstance(m.fc, nn.Linear):
            in_f = m.fc.in_features
            m.fc = nn.Linear(in_f, num_classes)
    return m


# =========================
# 체크포인트 로더 (shape 맞는 키만 로드)
# =========================
def load_state(model: nn.Module, ckpt_path: str):
    ckpt = torch.load(ckpt_path, map_location=DEVICE)
    state = ckpt.get("state_dict", ckpt)
    # DataParallel 제거
    state = {k.replace("module.", ""): v for k, v in state.items()}

    model_state = model.state_dict()
    filtered = {}
    skipped = []
    for k, v in state.items():
        if k in model_state and model_state[k].shape == v.shape:
            filtered[k] = v
        else:
            skipped.append(k)

    if skipped:
        print(f"[load_state] skipped {len(skipped)} mismatched keys (OK). sample={skipped[:8]}")

    msg = model.load_state_dict(filtered, strict=False)
    print(f"[load_state] loaded: missing={len(msg.missing_keys)} unexpected={len(msg.unexpected_keys)}")

    model.to(DEVICE).eval()
    return model


# =========================
# 라벨 매핑 로더
# =========================
def load_labels(variant: str) -> List[str]:
    json_map = {
        "category": "category_category_final2.json",
        "detail":   "category_detail_final2.json",
        "print":    "category_print_final2.json",
        "style":    "category_custom_final.json",
        "texture":  "category_texture_final2.json",
    }
    path = os.path.join(DATA_DIR, f"kfashion_{variant}", json_map[variant])
    n_cls = NUM_CLASSES[variant]

    # 기본 폴백 라벨
    default_labels = [f"{variant}_{i}" for i in range(n_cls)]

    if not os.path.exists(path):
        return default_labels

    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # (1) label -> id (value가 int) 형태
    # (2) id(str/int) -> label 형태
    try:
        first_val = next(iter(data.values()))
    except StopIteration:
        return default_labels

    labels: List[str] = default_labels

    if isinstance(first_val, int):
        # {"재킷":0, "점퍼":1, ...}
        size = max(data.values()) + 1
        labels = [""] * size
        for name, idx in data.items():
            if idx < size:
                labels[idx] = name
    else:
        # {"0":"재킷","1":"점퍼", ...} 또는 {0:"재킷", 1:"점퍼", ...}
        # 키를 정수로 변환 후 인덱스 위치에 배치
        try:
            pairs = [(int(k), v) for k, v in data.items()]
            size = max(k for k, _ in pairs) + 1
            tmp = [""] * size
            for k, v in pairs:
                if k < size:
                    tmp[k] = v
            labels = tmp
        except Exception:
            # 그래도 안 맞으면 값 리스트 그대로 시도
            if isinstance(data, dict):
                labels = list(data.values())

    # 클래스 수에 맞춰 잘라내기/패딩
    if len(labels) < n_cls:
        labels = labels + [f"{variant}_{i}" for i in range(len(labels), n_cls)]
    else:
        labels = labels[:n_cls]

    return labels


# =========================
# 1회 전체 로딩
# =========================
def load_once():
    if MODELS:
        return
    for variant, path in CKPT.items():
        print(f"[+] Loading {variant} model ...")
        m = build_model(variant)
        MODELS[variant] = load_state(m, path)
        LABEL_MAPS[variant] = load_labels(variant)
    print("[✓] All models loaded.")


# =========================
# 전처리 (ImageNet 정규화)
# =========================
def preprocess(pil_img: Image.Image) -> torch.Tensor:
    img = pil_img.convert("RGB").resize((224, 224))
    arr = np.array(img, dtype=np.float32) / 255.0  # HWC
    arr = arr.transpose(2, 0, 1)                   # CHW
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)[:, None, None]
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)[:, None, None]
    arr = (arr - mean) / std
    x = torch.from_numpy(arr).unsqueeze(0)         # 1CHW
    return x.to(DEVICE)


# =========================
# 추론/후처리
# =========================
@torch.no_grad()
def infer_logits(model: nn.Module, x: torch.Tensor) -> torch.Tensor:
    out = model(x)
    if out.ndim == 1:
        out = out.unsqueeze(0)
    return out

def topk_from_logits(logits: torch.Tensor, labels: List[str], k: int = 3):
    probs = torch.softmax(logits, dim=1)[0]
    k = min(k, probs.numel())
    val, idx = torch.topk(probs, k=k)
    return [{"label": labels[i], "score": float(val[j].item())} for j, i in enumerate(idx.tolist())]

def run_all(pil_img: Image.Image) -> Dict[str, Any]:
    load_once()
    x = preprocess(pil_img)
    out: Dict[str, Any] = {}
    for variant, model in MODELS.items():
        logits = infer_logits(model, x)
        out[variant] = topk_from_logits(logits, LABEL_MAPS[variant], k=3)
    return out

def to_keywords(merged: Dict[str, Any]):
    attrs = []
    for key, arr in merged.items():
        if not arr:
            continue
        best = arr[0]
        attrs.append({"key": key, "label": best["label"], "score": best["score"]})
    return attrs
