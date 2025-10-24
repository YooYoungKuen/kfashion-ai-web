from __future__ import annotations
from typing import Any, Dict, List
from .labelmap import load_label_map
from .normalize import norm
from .aliases import alias_to_canonical

class LabelAdapter:
    """
    - 모델 원시 출력(숫자 인덱스, 영문 토큰, dict 등)을
      최종 '정본 한글 라벨' 리스트로 변환한다.
    - 정본 라벨은 제공된 라벨맵(final2.json 등) 기준이다.
    """
    def __init__(self, paths: Dict[str, str]):
        self.maps: Dict[str, Dict[str, Dict]] = {}
        self.name_sets: Dict[str, Dict[str, str]] = {}
        for k, p in paths.items():
            idx2name, name2idx, nameset = load_label_map(p)
            self.maps[k] = {"idx2name": idx2name, "name2idx": name2idx}
            # 비교용: 정규화 string -> 정본(원문) string
            self.name_sets[k] = {norm(n): n for n in nameset}

    def map_items(self, task: str, items: List[Any]) -> List[Dict]:
        """
        입력 items 예:
          - [3, 10]                      # 인덱스
          - ["티셔츠","블라우스"]        # 문자열
          - [{"label":"체크","score":0.8}]
          - 혼합도 가능
        반환:
          [{"label": "<정본한글>", "score": <optional float>}, ...]
        """
        out = []
        idx2name = self.maps[task]["idx2name"]

        for it in items or []:
            score = None

            # 다양한 입력 케이스 분기
            if isinstance(it, dict):
                label = it.get("label")
                score = it.get("score")
            elif isinstance(it, int):
                label = idx2name.get(it)
            else:
                label = str(it)

            if not label:
                continue

            # style_숫자 토큰은 숨김
            if task == "style" and isinstance(label, str) and label.lower().startswith("style_"):
                continue

            # 1) 별칭 → 정본 치환 시도
            alias_hit = alias_to_canonical(task, label)
            if alias_hit:
                label = alias_hit

            # 2) 라벨맵 기준 정합성 확인(정규화 비교)
            key = norm(label)
            canonical = self.name_sets[task].get(key)
            if not canonical:
                # 라벨맵에 없는 라벨은 제외
                continue

            item = {"label": canonical}
            if score is not None:
                item["score"] = score
            out.append(item)

        # 중복 제거 (라벨 기준)
        seen = set()
        uniq = []
        for x in out:
            if x["label"] in seen:
                continue
            seen.add(x["label"])
            uniq.append(x)
        return uniq
