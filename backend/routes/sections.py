from fastapi import APIRouter

from backend.services.content import get_sections

router = APIRouter(prefix="/api/sections", tags=["sections"])


@router.get("")
def read_sections():
    return {"sections": get_sections()}
