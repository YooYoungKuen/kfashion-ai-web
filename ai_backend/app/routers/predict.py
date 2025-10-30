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
    merged = run_all(img)        # category/print/style/texture=Top-5, detail=Sigmoid
    attrs  = to_keywords(merged) # 각 task 대표 Top-1

    return PredictResponse(
        image_id=str(uuid.uuid4()),
        attributes=attrs,
        raw=merged,   # 상세는 raw에서 확인
    )
