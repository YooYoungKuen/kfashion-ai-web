from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class Attribute(BaseModel):
    key: str     # category / detail / print / style / texture
    label: str   # 한글 라벨명
    score: float # 0~1 확률

class PredictResponse(BaseModel):
    image_id: str
    attributes: List[Attribute]
    raw: Optional[Dict[str, Any]] = None  # 각 task의 top-k 결과 (옵션)
