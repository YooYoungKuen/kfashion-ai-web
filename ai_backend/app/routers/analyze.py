from fastapi import APIRouter, UploadFile, File, Form
from fastapi.responses import JSONResponse

router = APIRouter()

@router.post("/analyze-item")
async def analyze_item(file: UploadFile = File(...), gender: str = Form("female")):
    """
    K-Fashion 모델 추론용 엔드포인트
    - 프록시 경로: http://localhost:8081/api/fashion/analyze-kfashion
    - 실제 호출: http://127.0.0.1:8001/analyze-item
    """
    try:
        # TODO: 여기에 기존 K-Fashion 모델 로직 연결
        # (ex: kfashion_infer.py 호출 or ResNeSt 모델 실행)
        # 현재는 임시 응답 (백엔드 연결 테스트용)
        sample_result = {
            "gender": gender,
            "magazine": "감각적인 겨울룩 — 니트와 코트의 조화로 따뜻한 세련미를 완성합니다.",
            "keywords": ["겨울코디", "니트", "코트", "브라운", "베이지"],
            "styles": [
                {
                    "title": "모던 윈터 캐주얼",
                    "description": "톤온톤 컬러로 따뜻하면서 세련된 스타일 연출. 니트와 코트의 질감 대비가 매력적입니다.",
                    "colorTip": "브라운, 베이지, 크림 톤 조합이 안정적입니다.",
                    "accessoryTip": "심플한 가죽 숄더백이나 브라운 머플러로 포인트.",
                    "matchTip": "하이웨스트 팬츠와 브라운 앵클부츠로 완성.",
                    "shopQueries": ["브라운 니트 코트", "겨울 데일리룩", "톤온톤 코디"]
                }
            ]
        }
        return JSONResponse(content=sample_result, status_code=200)

    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)
