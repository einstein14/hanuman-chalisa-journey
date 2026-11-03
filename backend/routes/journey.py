from fastapi import APIRouter

from backend.services.content import get_journey

router = APIRouter(prefix="/api/journey", tags=["journey"])


@router.get("")
def read_journey():
    return get_journey()
