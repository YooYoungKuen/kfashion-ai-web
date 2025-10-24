import re
import unicodedata

NBSP = "\u00A0"  # non-breaking space 문자

def norm(s: str) -> str:
    s = unicodedata.normalize("NFKC", str(s))
    s = s.replace(NBSP, " ")
    s = re.sub(r"\s+", " ", s)
    s = re.sub(r"\s*([/|-])\s*", r"\1", s)
    s = s.strip()
    return s.lower()
