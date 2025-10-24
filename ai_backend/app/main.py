from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import labels

app = FastAPI(title="K-Fashion Inference API", version="1.0.0")

from app.routers import predict, debug
from app.routers import shop    # ← 추가

ALLOWED_ORIGINS = [
    "http://localhost:3000","http://127.0.0.1:3000",
    "http://localhost:5173","http://127.0.0.1:5173",
    "http://localhost:8080","http://127.0.0.1:8080",
]

app.add_middleware(CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/health")
def health(): return {"status":"ok"}

app.include_router(predict.router, prefix="/predict", tags=["predict"])
app.include_router(debug.router,   prefix="/debug",   tags=["debug"])
app.include_router(shop.router,    prefix="/shop",    tags=["shop"])   # ← 추가
app.include_router(labels.router, prefix="/labels", tags=["labels"])