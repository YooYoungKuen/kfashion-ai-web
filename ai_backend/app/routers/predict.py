from fastapi import APIRouter, UploadFile, File, HTTPException
from io import BytesIO
from PIL import Image
import uuid

from app.schemas.io import PredictResponse
from app.services.kfashion_infer import run_all, to_keywords

router = APIRouter()

@router.post("", response_model=PredictResponse)
async def predict(file: UploadFile = File(...)):
    # 파일 읽기 → PIL 이미지 변환
    try:
        content = await file.read()
        img = Image.open(BytesIO(content)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="이미지 파일을 읽을 수 없습니다.")

    # 5개 모델 추론
    merged = run_all(img)        # {"category":[...], "detail":[...], ...}
    attrs  = to_keywords(merged) # 각 task top-1

    return PredictResponse(
        image_id=str(uuid.uuid4()),
        attributes=attrs,
        raw=merged,   # 프론트에서 상세(top3)도 쓰고 싶으면 유지, 아니면 제거해도 됨
    )
