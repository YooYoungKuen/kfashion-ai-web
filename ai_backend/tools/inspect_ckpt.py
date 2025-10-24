import os, sys, torch, json

# 경로 인자 받기 (없으면 카테고리 기본 경로 사용)
if len(sys.argv) > 1:
    ckpt_path = sys.argv[1]
else:
    # 프로젝트 기본 경로 기준
    ROOT = os.path.dirname(os.path.dirname(__file__))  # ai_backend/
    CKPT = os.path.join(ROOT, "app", "kfashion_ai_model", "checkpoint",
                        "kfashion_category", "model_category_best.pth.tar")
    ckpt_path = CKPT

print(f"[i] load: {ckpt_path}")
state = torch.load(ckpt_path, map_location="cpu")
sd = state.get("state_dict", state)

keys = list(sd.keys())
print(f"[i] total keys: {len(keys)}")
print("[i] first 40 keys:")
for k in keys[:40]:
    print("  -", k)

# 간단한 휴리스틱으로 아키텍처/헤드 추정
text = " ".join(keys[:200])
arch = "unknown"
if any(s in text for s in ["layer1.", "conv1.", "bn1.", "fc."]):
    arch = "resnet"
if any(s in text for s in ["body.", "global_pool", "classifier."]):
    arch = "tresnet"
if any(s in text for s in ["gcn.", "adj", "wordvec"]):
    arch = "mlgcn"

print(f"[i] guess arch: {arch}")

# 분류 헤드의 weight/bias 모양으로 클래스 수 추정
candidates = [
    "fc.weight","classifier.weight","module.fc.weight","module.classifier.weight",
    "head.weight","linear.weight"
]
num_classes = None
for name in candidates:
    if name in sd:
        w = sd[name]
        if w.ndim == 2:
            num_classes = w.shape[0]
            print(f"[i] classifier: {name}, weight shape={tuple(w.shape)} => num_classes={num_classes}")
            break

if num_classes is None:
    print("[!] classifier weight key를 못 찾음 (헤드명이 다를 수 있음). 아래 키 목록 참고:")
    print("\n".join([k for k in keys if k.endswith("weight")]))

# (선택) 라벨 매핑도 같이 확인
try:
    DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "kfashion_ai_model", "data")
    mapping_path = os.path.join(DATA_DIR, "kfashion_category", "category_category_final2.json")
    name_to_idx = json.load(open(mapping_path, "r", encoding="utf-8"))
    idx_to_name = {int(v):k for k,v in name_to_idx.items()}
    print(f"[i] labels in mapping: {len(idx_to_name)} (ex: 0->{idx_to_name.get(0)})")
except Exception as e:
    print("[i] label mapping check skipped:", e)
