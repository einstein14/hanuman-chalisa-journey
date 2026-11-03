import json
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.services.content import get_verses

client = TestClient(app)
DATA = Path(__file__).resolve().parent.parent / "data"


def test_verse_counts():
    verses = get_verses()
    assert len(verses) == 43
    intro = [v for v in verses if v["type"] == "introductory_doha"]
    chaupai = [v for v in verses if v["type"] == "chaupai"]
    end = [v for v in verses if v["type"] == "concluding_doha"]
    assert len(intro) == 2
    assert len(chaupai) == 40
    assert len(end) == 1


def test_verse_fields_complete():
    for v in get_verses():
        assert v["hindi"].strip()
        assert v["telugu"].strip()
        assert v["english_transliteration"].strip()
        assert v["meaning_english"].strip()
        assert v["meaning_telugu"].strip()
        assert v["why_special_english"].strip()
        assert v["why_special_telugu"].strip()
        assert "game" in v


def test_audio_paths_null_or_static():
    for v in get_verses():
        audio = v.get("audio")
        assert audio is None or audio.startswith("/audio/")


def test_games_only_learned():
    res = client.get("/api/games?learned=3,99")
    assert res.status_code == 200
    data = res.json()
    assert 3 in data["learned_ids"]
    assert 99 not in data["learned_ids"]
    for q in data["questions"]:
        assert q["verse_id"] == 3


def test_api_404():
    assert client.get("/api/verses/9999").status_code == 404
    assert client.get("/api/stories/9999").status_code == 404


def test_health_and_verses():
    assert client.get("/health").json()["status"] == "ok"
    res = client.get("/api/verses")
    assert res.status_code == 200
    assert len(res.json()["verses"]) == 43


def test_journey_and_stories():
    assert client.get("/api/journey").status_code == 200
    stories = client.get("/api/stories").json()["stories"]
    assert len(stories) == 7


def test_sections_youtube_full_chalisa():
    res = client.get("/api/sections")
    assert res.status_code == 200
    full = res.json()["sections"]["full_chalisa"]
    assert full.get("youtube_id") == "09BbL0jU7ys"
