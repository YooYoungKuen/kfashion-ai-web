from __future__ import annotations
import json
from pathlib import Path
from typing import Dict, Tuple, Set, Union, Any

JsonLike = Union[Dict[str, Any], list]

def _load_json(path: Union[str, Path]) -> JsonLike:
    p = Path(path)
    if not p.exists():
        raise FileNotFoundError(f"Label map not found: {p}")
    with p.open("r", encoding="utf-8") as f:
        return json.load(f)

def load_label_map(path: Union[str, Path]) -> Tuple[Dict[int, str], Dict[str, int], Set[str]]:
    """
    지원 형태
      1) ["티셔츠","블라우스", ...]                  # list (index = 배열 인덱스)
      2) {"0":"티셔츠","1":"블라우스", ...}         # idx -> name
      3) {"티셔츠":0, "블라우스":1, ...}            # name -> idx
    반환
      (idx_to_name, name_to_idx, canonical_name_set)
    """
    data = _load_json(path)
    idx_to_name: Dict[int, str] = {}
    name_to_idx: Dict[str, int] = {}

    if isinstance(data, list):
        for i, name in enumerate(data):
            name = str(name)
            idx_to_name[i] = name
            name_to_idx[name] = i

    elif isinstance(data, dict):
        keys = list(data.keys())
        if all(isinstance(k, str) and k.isdigit() for k in keys):
            # "0": "티셔츠"
            for k, v in data.items():
                idx = int(k)
                name = str(v)
                idx_to_name[idx] = name
                name_to_idx[name] = idx
        else:
            # "티셔츠": 0
            for k, v in data.items():
                name = str(k)
                idx = int(v)
                idx_to_name[idx] = name
                name_to_idx[name] = idx
    else:
        raise ValueError(f"Unsupported label map format at {path}")

    return idx_to_name, name_to_idx, set(name_to_idx.keys())
