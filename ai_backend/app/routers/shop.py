from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import os
import httpx
from urllib.parse import quote

from dotenv import load_dotenv
load_dotenv()

router = APIRouter()

NAVER_ID = os.getenv("NAVER_CLIENT_ID")
NAVER_SECRET = os.getenv("NAVER_CLIENT_SECRET")
NAVER_URL = "https://openapi.naver.com/v1/search/shop.json"

HEADERS = {
    "X-Naver-Client-Id": NAVER_ID or "",
    "X-Naver-Client-Secret": NAVER_SECRET or "",
}

@router.get("")
async def shop_search(
    q: str = Query(..., min_length=1, description="검색 쿼리"),
    display: int = Query(20, ge=1, le=100),
    start: int = Query(1, ge=1, le=1000),
    sort: str = Query("sim", pattern="^(sim|date|asc|dsc)$"),  # 네이버 정렬 옵션
):
    if not NAVER_ID or not NAVER_SECRET:
        raise HTTPException(500, detail="Naver API 키가 설정되지 않았습니다(.env 확인).")

    params = f"?query={quote(q)}&display={display}&start={start}&sort={sort}"

    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(NAVER_URL + params, headers=HEADERS)
            if r.status_code != 200:
                raise HTTPException(r.status_code, detail=r.text)
            data = r.json()
    except httpx.TimeoutException:
        raise HTTPException(504, detail="Naver API 타임아웃")
    except Exception as e:
        raise HTTPException(500, detail=f"Naver API 오류: {e}")

    # 프론트가 쓰기 좋게 최소 필드만 추려서 반환
    items = []
    for it in data.get("items", []):
        items.append({
            "title": it.get("title", ""),           # HTML 태그 포함됨 주의
            "image": it.get("image"),
            "link": it.get("link"),
            "lprice": it.get("lprice"),
            "hprice": it.get("hprice"),
            "mallName": it.get("mallName"),
            "brand": it.get("brand"),
            "maker": it.get("maker"),
            "category1": it.get("category1"),
            "category2": it.get("category2"),
        })
    return {"total": data.get("total", 0), "items": items}
