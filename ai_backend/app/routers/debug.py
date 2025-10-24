from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict, List, Any
from app.utils.adapter import LabelAdapter

# predict.py의 ADAPTER를 재사용하는 편이 좋습니다.
ADAPTER = LabelAdapter({
    "category": "app/kfashion_ai_model/data/kfashion_category/category_category_final2.json",
    "detail":   "app/kfashion_ai_model/data/kfashion_detail/category_detail_final2.json",
    "print":    "app/kfashion_ai_model/data/kfashion_print/category_print_final2.json",
    "style":    "app/kfashion_ai_model/data/kfashion_style/category_custom_final.json",
    "texture":  "app/kfashion_ai_model/data/kfashion_texture/category_texture_final2.json",
})

router = APIRouter()

class MapReq(BaseModel):
    data: Dict[str, List[Any]]  # 예: {"print":["houndstooth","체크"]}

@router.post("/map_check")
def map_check(req: MapReq):
    out = {}
    for k, arr in req.data.items():
        out[k] = ADAPTER.map_items(k, arr)
    return out
