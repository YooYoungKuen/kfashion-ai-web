from typing import Optional, Dict
from .normalize import norm

# 필요한 만큼 계속 추가/수정 가능 (라벨맵의 '정본' 문자열로 매핑하세요)
ALIASES_RAW: Dict[str, Dict[str, str]] = {
    "print": {
        "houndstooth": "하운즈 투스",
        "하운드투스": "하운즈 투스",
        "하운즈투스": "하운즈 투스",
        "gingham": "깅엄",
        "argyle": "아가일",
        "zebra": "지브라",
        "leopard": "호피",
        "paisley": "페이즐리",
        "dots": "도트",
        "stripe": "스트라이프",
        "lettering": "레터링",
        "grad": "그라데이션",
        "gradient": "그라데이션",
        "camo": "카무플라쥬",
        "camouflage": "카무플라쥬",
        "tie-dye": "타이다이",
        "타이 다이": "타이다이",
    },
    "detail": {
        "x-스트랩": "X스트랩",
        "xstrap": "X스트랩",
        "ruffle": "러플",
        "pleats": "플리츠",
        "plait": "플리츠",
        "zip": "지퍼",
        "button": "단추",
        "pocket": "포켓",
        "lace": "레이스",
        "frill": "프릴",
        "quilted": "퀄팅",
        "destroyed": "디스트로이드",
        "asymmetric": "비대칭",
        "asym": "비대칭",
        "shirring": "셔링",
        "peplum": "페플럼",
        "chain": "체인",
        "tassel": "태슬",
    },
    "texture": {
        "pvc": "비닐/PVC",
        "vinyl": "비닐/PVC",
        "cashmere": "울/캐시미어",
        "wool": "울/캐시미어",
        "fur": "퍼",
        "suede": "스웨이드",
        "leather": "가죽",
        "denim": "데님",
        "chiffon": "시폰",
        "tweed": "트위드",
        "velvet": "벨벳",
        "corduroy": "코듀로이",
        "mesh": "메시",
        "sequin": "시퀸/글리터",
        "glitter": "시퀸/글리터",
        "jersey": "저지",
        "linen": "린넨",
        "fleece": "플리스",
        "neoprene": "네오프렌",
        "jacquard": "자카드",
        # 필요 시 보강
    },
    "style": {
        "minimal": "미니멀",
        "street": "스트릿",
        "office": "오피스",
        "basic": "베이직",
        "casual": "캐주얼",
        "feminine": "페미닌",
    },
    "category": {
        # 필요 시 추가
    },
}

# 정규화된 키로 빠르게 조회할 수 있도록 준비
ALIASES = {
    task: {norm(k): v for k, v in table.items()}
    for task, table in ALIASES_RAW.items()
}

def alias_to_canonical(task: str, s: str) -> Optional[str]:
    """
    task별 별칭 테이블에서 정규화된 키로 검색.
    있으면 정본(라벨맵 기준 한글) 반환, 없으면 None.
    """
    return ALIASES.get(task, {}).get(norm(s))
