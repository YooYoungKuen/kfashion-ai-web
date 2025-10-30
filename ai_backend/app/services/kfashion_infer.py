from typing import Dict, Any, List
import sys, os
sys.path.append(os.path.dirname(os.path.dirname(__file__)))  # app/
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))  # ai_backend/

import json
import numpy as np
import torch
import torch.nn as nn
from PIL import Image

# ResNeSt-50d (category/detail/print/texture에서 사용)
from app.kfashion_ai_model.utility.resnest import resnest50d

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

# 클래스 수
NUM_CLASSES = {
    "category": 21,
    "detail":   40,  # detail: multi-label 해석
    "print":    21,
    "style":    10,  # style: 10 클래스 (multi-label 해석)
    "texture":  27,
}

# 전역 캐시
MODELS: Dict[str, nn.Module] = {}
LABEL_MAPS: Dict[str, List[str]] = {}

# ── (표현 확장) 스타일 별칭 로더 ─────────────────────────────
STYLE_ALIAS_PATH = os.path.join(DATA_DIR, "kfashion_style", "style_aliases.json")
try:
    with open(STYLE_ALIAS_PATH, "r", encoding="utf-8") as f:
        STYLE_ALIASES: Dict[str, List[str]] = json.load(f)
except Exception:
    STYLE_ALIASES = {}

def add_style_alias(out: Dict[str, Any]) -> Dict[str, Any]:
    items = out.get("style", [])
    if not items or not isinstance(items, list):
        return out
    for item in items:
        name = item.get("label")
        if isinstance(name, str) and name in STYLE_ALIASES:
            item["aliases"] = STYLE_ALIASES[name]
    return out
# ───────────────────────────────────────────────────────────

# =========================
# 스타일 ckpt 키 리매핑 (features.* → torchvision resnet)
# =========================
def _remap_style_keys(state: Dict[str, torch.Tensor]) -> Dict[str, torch.Tensor]:
    """
    style 체크포인트의 keys가 features.* 형태일 때 torchvision resnet50 네이밍으로 변환
    - features.0. → conv1.
    - features.1. → bn1.
    - features.4. → layer1.
    - features.5. → layer2.
    - features.6. → layer3.
    - features.7. → layer4.
    분류 헤드(예: gc1/gc2 등)는 매칭 불가이므로 스킵하고, 우리의 fc(=10클래스)를 사용.
    """
    out: Dict[str, torch.Tensor] = {}
    for k, v in state.items():
        if not k.startswith("features."):
            # stem/layer 외 기타 키(gc1/gc2 등)는 무시
            continue
        nk = k
        nk = nk.replace("features.0.", "conv1.")
        nk = nk.replace("features.1.", "bn1.")
        nk = nk.replace("features.4.", "layer1.")
        nk = nk.replace("features.5.", "layer2.")
        nk = nk.replace("features.6.", "layer3.")
        nk = nk.replace("features.7.", "layer4.")
        out[nk] = v
    return out

# =========================
# 백본 빌더
# =========================
def build_model(variant: str) -> nn.Module:
    n = NUM_CLASSES[variant]
    try:
        if variant == "style":
            # 스타일 모델은 torchvision resnet50 백본 사용 (ckpt가 features.* 키 구조)
            from torchvision.models import resnet50
            m = resnet50()
            if hasattr(m, "fc") and isinstance(m.fc, nn.Linear):
                m.fc = nn.Linear(m.fc.in_features, n)
            else:
                # 혹시 구조 상이 시 안전 장치
                last_ch = getattr(m, "last_channel", 2048)
                m.fc = nn.Linear(last_ch, n)
            return m

        # 나머지 모델은 ResNeSt-50d 백본
        m = resnest50d(pretrained=False, num_classes=n)
        return m
    except Exception as e:
        print(f"[backbone] import failed ({e}), fallback to torchvision.resnet50")
        from torchvision.models import resnet50
        m = resnet50()
        if hasattr(m, "fc") and isinstance(m.fc, nn.Linear):
            m.fc = nn.Linear(m.fc.in_features, n)
        return m

# =========================
# 최종 분류기(out_features) 추출
# =========================
def _get_out_features(m: nn.Module) -> int:
    if hasattr(m, "fc") and isinstance(m.fc, nn.Linear):
        return m.fc.out_features
    if hasattr(m, "classifier"):
        if isinstance(m.classifier, nn.Sequential) and len(m.classifier) > 0:
            for mod in reversed(list(m.classifier)):
                if isinstance(mod, nn.Linear):
                    return mod.out_features
        if isinstance(m.classifier, nn.Linear):
            return m.classifier.out_features
    for _, mod in reversed(list(m.named_modules())):
        if isinstance(mod, nn.Linear):
            return mod.out_features
    return -1

# =========================
# 체크포인트 로더 (shape 맞는 키만 로드 + 로드율 로그)
# =========================
def load_state(model: nn.Module, ckpt_path: str):
    ckpt = torch.load(ckpt_path, map_location=DEVICE)
    state = ckpt.get("state_dict", ckpt)
    state = {k.replace("module.", ""): v for k, v in state.items()}  # DataParallel 제거

    # --- 스타일 전용: features.* 키를 torchvision resnet 네이밍으로 리매핑
    if any(k.startswith("features.") for k in state.keys()):
        mapped = _remap_style_keys(state)
        if mapped:
            state = mapped

    model_state = model.state_dict()
    filtered = {}
    skipped = []
    for k, v in state.items():
        if k in model_state and model_state[k].shape == v.shape:
            filtered[k] = v
        else:
            skipped.append(k)

    if skipped:
        print(f"[load_state] skipped={len(skipped)}  (shape mismatch)  sample={skipped[:8]}")

    msg = model.load_state_dict(filtered, strict=False)
    print(f"[load_state] loaded  missing={len(msg.missing_keys)}  unexpected={len(msg.unexpected_keys)}")

    # 로드율
    loaded_params = sum(p.numel() for k, p in model.named_parameters() if k in filtered)
    total_params  = sum(p.numel() for p in model.parameters())
    ratio = loaded_params / max(1, total_params)
    print(f"[load_state] loaded_params={loaded_params}/{total_params} ({ratio:.1%})")

    model.to(DEVICE).eval()
    return model, ratio

# =========================
# 라벨 매핑 로더
# =========================
def load_labels(variant: str) -> List[str]:
    """
    variant별 JSON 라벨맵을 로드하여, 학습 시 인덱스 순서에 맞게 정렬된 라벨 리스트 반환.
    - JSON 구조: {"드레스": 9, "팬츠": 8, ...} 또는 {"0": "재킷", "1": "조거팬츠", ...}
    - 자동으로 key/value를 인덱스 기준으로 정렬해 올바른 순서를 보장.
    """
    json_map = {
        "category": "category_category_final2.json",
        "detail":   "category_detail_final2.json",
        "print":    "category_print_final2.json",
        "style":    "category_custom_final.json",
        "texture":  "category_texture_final2.json",
    }
    path = os.path.join(DATA_DIR, f"kfashion_{variant}", json_map[variant])
    n_cls = NUM_CLASSES[variant]

    default_labels = [f"{variant}_{i}" for i in range(n_cls)]
    if not os.path.exists(path):
        return default_labels

    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception:
        print(f"[WARN] Failed to load label file: {path}")
        return default_labels

    labels: List[str] = []

    # (교체) dict 처리 블록 내부
    if isinstance(data, dict):
        items = []
        for k, v in data.items():
            # 케이스 1) {"드레스": 9} → value가 int index
            if isinstance(v, int):
                idx, name = v, k
            # ✅ 케이스 1-보강) {"드레스": "9"} → value가 str 숫자
            elif isinstance(v, str) and v.isdigit():
                idx, name = int(v), k
            # 케이스 2) {"0": "드레스"} → key가 index
            elif isinstance(k, str) and k.isdigit():
                idx, name = int(k), v
            else:
                continue
            items.append((idx, name))
        items.sort(key=lambda x: x[0])
        labels = [name for _, name in items]


    # ✅ list 기반 JSON 처리 (["티셔츠","팬츠",...])
    elif isinstance(data, list):
        labels = data

    # ✅ 보정 (모델 클래스 수에 맞춤)
    if len(labels) < n_cls:
        labels += [f"{variant}_{i}" for i in range(len(labels), n_cls)]
    elif len(labels) > n_cls:
        labels = labels[:n_cls]

    print(f"[load_labels] {variant}: {len(labels)} labels loaded")
    return labels


# =========================
# 1회 전체 로딩 (+일치성 검증)
# =========================
def load_once():
    if MODELS:
        return
    for variant, path in CKPT.items():
        print(f"[+] Loading {variant} model ...")
        m = build_model(variant)
        m, _ = load_state(m, path)  # 모든 variant 공통 로드
        MODELS[variant] = m
        LABEL_MAPS[variant] = load_labels(variant)

        # --- 일치성 검증 ---
        out_feats = _get_out_features(m)
        n_cls = NUM_CLASSES[variant]
        if out_feats != -1 and out_feats != n_cls:
            raise RuntimeError(
                f"[FATAL] Head size mismatch for '{variant}': "
                f"model.out_features={out_feats} vs NUM_CLASSES={n_cls}"
            )
        if len(LABEL_MAPS[variant]) != n_cls:
            raise RuntimeError(
                f"[FATAL] Label size mismatch for '{variant}': "
                f"len(labels)={len(LABEL_MAPS[variant])} vs NUM_CLASSES={n_cls}"
            )
        print(f"[OK] {variant}: head={out_feats}, classes={n_cls}, labels={len(LABEL_MAPS[variant])}")
    print("[✓] All models loaded & validated.")

# --- letterbox resize (keep aspect, pad to square) ---
def _letterbox(img: Image.Image, size: int = 224, fill=(128, 128, 128)) -> Image.Image:
    w, h = img.size
    scale = min(size / w, size / h)
    nw, nh = int(round(w * scale)), int(round(h * scale))
    img_resized = img.resize((nw, nh), Image.BILINEAR)

    canvas = Image.new("RGB", (size, size), fill)
    left = (size - nw) // 2
    top  = (size - nh) // 2
    canvas.paste(img_resized, (left, top))
    return canvas





# =========================
# 전처리 (ImageNet 정규화)
# =========================
def preprocess(pil_img: Image.Image) -> torch.Tensor:
    img = pil_img.convert("RGB")
    # ✅ 센터크롭 대신 레터박스 적용 (전신 의류 분류 개선)
    img = _letterbox(img, size=224, fill=(128, 128, 128))

    arr = np.asarray(img, dtype=np.float32) / 255.0
    arr = arr.transpose(2, 0, 1)
    mean = np.array([0.485, 0.456, 0.406], dtype=np.float32)[:, None, None]
    std  = np.array([0.229, 0.224, 0.225], dtype=np.float32)[:, None, None]
    arr = (arr - mean) / std
    x = torch.from_numpy(arr).unsqueeze(0)
    return x.to(DEVICE)



# =========================
# 추론/후처리 (Softmax Top-1, Sigmoid Multi-Label)
# =========================
@torch.no_grad()
def infer_logits(model: nn.Module, x: torch.Tensor) -> torch.Tensor:
    out = model(x)
    if out.ndim == 1:
        out = out.unsqueeze(0)
    return out

def top1_softmax(logits: torch.Tensor, labels: List[str]):
    probs = torch.softmax(logits, dim=1)[0]  # (C,)
    val, idx = torch.topk(probs, k=1)
    i = int(idx[0].item())
    return [{"label": labels[i], "score": float(val[0].item())}]

# =========================
# (추가) Softmax Top-K
# =========================
def topk_softmax(logits, labels, k: int = 3, min_score: float = 0.0):
    probs = torch.softmax(logits, dim=1)[0]
    k = min(k, probs.numel())
    vals, idxs = torch.topk(probs, k=k)
    items = [
        {"label": labels[int(i.item())], "score": float(vals[j].item())}
        for j, i in enumerate(idxs)
    ]
    if min_score > 0:
        items = [it for it in items if it["score"] >= min_score]
    return items





def multilabel_sigmoid(
    logits: torch.Tensor,
    labels: List[str],
    threshold: float = 0.5,
    fallback_top1: bool = True
):
    probs = torch.sigmoid(logits)[0]  # (C,)
    sel_idx = (probs >= threshold).nonzero(as_tuple=True)[0].tolist()
    items = [{"label": labels[i], "score": float(probs[i].item())} for i in sel_idx]
    items.sort(key=lambda x: x["score"], reverse=True)
    if not items and fallback_top1:
        return top1_softmax(logits, labels)
    return items

def run_all(pil_img: Image.Image) -> Dict[str, Any]:
    """
    - category/print/texture → Softmax Top-3
    - detail/style           → Sigmoid 멀티라벨(th=0.5), 없으면 Top-1 폴백
    """
    load_once()
    x = preprocess(pil_img)
    out: Dict[str, Any] = {}
    for variant, model in MODELS.items():
        logits = infer_logits(model, x)
        if variant in ("detail", "style"):
            out[variant] = multilabel_sigmoid(
                logits, LABEL_MAPS[variant], threshold=0.5, fallback_top1=True
            )  # fallback은 top1_softmax를 그대로 사용
        else:
            out[variant] = topk_softmax(logits, LABEL_MAPS[variant], k=3, min_score=0.05)
    out = add_style_alias(out)
    return out

def to_keywords(merged: Dict[str, Any]):
    attrs = []
    for key, arr in merged.items():
        if not arr:
            continue
        best = arr[0]
        attrs.append({"key": key, "label": best["label"], "score": best["score"]})
        # detail/style이 멀티라벨이어도 대표 1개만 선택(요구사항대로)
    return attrs
