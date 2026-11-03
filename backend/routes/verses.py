from fastapi import APIRouter, HTTPException

from backend.services.content import get_verse, get_verses

router = APIRouter(prefix="/api/verses", tags=["verses"])


@router.get("")
def list_verses():
    return {"verses": get_verses()}


@router.get("/{verse_id}")
def read_verse(verse_id: int):
    verse = get_verse(verse_id)
    if verse is None:
        raise HTTPException(status_code=404, detail="Verse not found")
    return verse
