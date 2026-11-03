from fastapi import APIRouter, HTTPException

from backend.services.content import get_stories, get_story

router = APIRouter(prefix="/api/stories", tags=["stories"])


@router.get("")
def list_stories():
    return {"stories": get_stories()}


@router.get("/{story_id}")
def read_story(story_id: int):
    story = get_story(story_id)
    if story is None:
        raise HTTPException(status_code=404, detail="Story not found")
    return story
