# K-Fashion AI Web Project

AI-Hub의 **K-Fashion 모델**을 활용해  
의류 이미지를 분석하고 5가지 속성으로 분류하는 웹 서비스입니다.  
(카테고리 · 디테일 · 프린트 · 스타일 · 텍스처)

---

## 프로젝트 개요
- 사용자가 이미지를 업로드하면 AI가 옷의 특징을 자동 분석합니다.  
- 분석된 결과는 체크박스 형태로 표시되며,  
  이후 네이버 쇼핑 API를 통해 유사한 상품을 추천할 예정입니다.

---

## 실행 방법

### AI 서버 (FastAPI)
```bash
cd ai_backend
python -m venv .venv
.\.venv\Scripts\activate (가상환경 접속)
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --reload (ai_backend 서버 접속)

## predict 테스트
.\.venv\Scripts\Activate.ps1 (가상환경)
start http://127.0.0.1:8001/docs (swagger ui test)


### backend(Spring Boot)
cd backend
.\gradlew.bat clean bootRun

### frontend (React)
cd frontend
npm install
npm start


