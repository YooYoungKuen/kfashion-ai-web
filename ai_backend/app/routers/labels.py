from fastapi import APIRouter
from app.services.kfashion_infer import load_labels

router = APIRouter()

@router.get("")
def get_all_labels():
    out = {}
    for variant in ["category", "detail", "print", "style", "texture"]:
        labels = load_labels(variant)
        out[variant] = labels
    return out
