import json
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"


def _load_json(name: str):
    path = DATA_DIR / name
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def get_verses():
    return _load_json("hanuman_chalisa.json")["verses"]


def get_verse(verse_id: int):
    for v in get_verses():
        if v["id"] == verse_id:
            return v
    return None


def get_stories():
    return _load_json("stories.json")["stories"]


def get_story(story_id: int):
    for s in get_stories():
        if s["id"] == story_id:
            return s
    return None


def get_journey():
    return _load_json("journey.json")


def get_sections():
    return _load_json("hanuman_chalisa.json").get("sections", {})
