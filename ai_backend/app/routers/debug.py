# ai_backend/app/routers/debug.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Any

# 라벨 매핑 점검용
from app.utils.adapter import LabelAdapter

# 모델/라벨맵 강제 리로드 & 라벨 인덱스 확인용
from app.services.kfashion_infer import MODELS, LABEL_MAPS, load_once, NUM_CLASSES

router = APIRouter()

# ─────────────────────────────────────────────────────────────
# 1) 라벨 매핑 점검: /debug/map_check
#    예: {"print":["houndstooth","체크"]} → 정본 한글로 매핑 결과
# ─────────────────────────────────────────────────────────────
ADAPTER = LabelAdapter({
    "category": "app/kfashion_ai_model/data/kfashion_category/category_category_final2.json",
    "detail":   "app/kfashion_ai_model/data/kfashion_detail/category_detail_final2.json",
    "print":    "app/kfashion_ai_model/data/kfashion_print/category_print_final2.json",
    "style":    "app/kfashion_ai_model/data/kfashion_style/category_custom_final.json",
    "texture":  "app/kfashion_ai_model/data/kfashion_texture/category_texture_final2.json",
})

class MapReq(BaseModel):
    data: Dict[str, List[Any]]  # 예: {"print":["houndstooth","체크"]}

@router.post("/map_check")
def map_check(req: MapReq):
    out = {}
    for k, arr in req.data.items():
        out[k] = ADAPTER.map_items(k, arr)
    return out

# ─────────────────────────────────────────────────────────────
# 2) 강제 리로드: /debug/reload
#    모델/라벨맵 캐시를 비우고 다시 load_once()
# ─────────────────────────────────────────────────────────────
@router.post("/reload")
def reload_models():
    MODELS.clear()
    LABEL_MAPS.clear()
    load_once()
    return {"ok": True, "models": list(MODELS.keys())}

# ─────────────────────────────────────────────────────────────
# 3) 라벨 인덱스 테이블 확인: /debug/labelmap/{variant}
#    예: /debug/labelmap/category → idx 9가 "드레스"인지 확인
# ─────────────────────────────────────────────────────────────
@router.get("/labelmap/{variant}")
def labelmap(variant: str):
    if variant not in NUM_CLASSES:
        return {"error": f"bad variant: {variant}"}
    labels = LABEL_MAPS.get(variant)
    if not labels:
        load_once()
        labels = LABEL_MAPS.get(variant, [])
    return {
        "variant": variant,
        "count": len(labels),
        "labels": [{"idx": i, "name": n} for i, n in enumerate(labels)],
    }

# ─────────────────────────────────────────────────────────────
# 4) 앞부분만 빠르게 보기: /debug/top5/{variant}
# ─────────────────────────────────────────────────────────────
@router.get("/top5/{variant}")
def top5_preview(variant: str):
    if variant not in NUM_CLASSES:
        return {"error": f"bad variant: {variant}"}
    labels = LABEL_MAPS.get(variant)
    if not labels:
        load_once()
        labels = LABEL_MAPS.get(variant, [])
    return {
        "variant": variant,
        "first10": [{"idx": i, "name": n} for i, n in enumerate(labels[:10])],
    }
