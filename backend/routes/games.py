import random
from typing import Optional

from fastapi import APIRouter, Query

from backend.services.content import get_verses

router = APIRouter(prefix="/api/games", tags=["games"])


def _parse_learned(learned: Optional[str]) -> set[int]:
    if not learned or not learned.strip():
        return set()
    ids = set()
    for part in learned.split(","):
        part = part.strip()
        if part.isdigit():
            ids.add(int(part))
    return ids


def _words_from_hindi(hindi: str) -> list[str]:
    cleaned = hindi.replace("।", " ").replace("॥", " ").replace("|", " ")
    return [w for w in cleaned.split() if w.strip()]


def build_games_for_verse(verse: dict, all_verses: list[dict]) -> list[dict]:
    vid = verse["id"]
    game_meta = verse.get("game") or {}
    questions = []

    blank = game_meta.get("blank_word")
    options = game_meta.get("blank_options")
    if blank and options and len(options) >= 2:
        hindi = verse["hindi"]
        display = hindi.replace(blank, "____")
        questions.append(
            {
                "type": "fill_blank",
                "verse_id": vid,
                "prompt_hindi": display,
                "correct": blank,
                "options": options,
            }
        )

    arrange = game_meta.get("arrange_lines")
    if arrange and len(arrange) >= 2:
        shuffled = arrange.copy()
        random.seed(vid * 17)
        random.shuffle(shuffled)
        questions.append(
            {
                "type": "arrange_lines",
                "verse_id": vid,
                "lines": arrange,
                "shuffled": shuffled,
            }
        )

    wrong = game_meta.get("wrong_meanings_en") or []
    if verse.get("meaning_english"):
        choices = [verse["meaning_english"]] + wrong[:2]
        random.seed(vid * 31)
        random.shuffle(choices)
        questions.append(
            {
                "type": "match_meaning",
                "verse_id": vid,
                "verse_preview": verse["hindi"][:80],
                "correct": verse["meaning_english"],
                "options": choices,
                "lang": "en",
            }
        )

    if verse.get("audio"):
        others = [v for v in all_verses if v["id"] != vid and v["type"] == verse["type"]][:2]
        if len(others) >= 2:
            opts = [verse] + others
            random.seed(vid * 43)
            random.shuffle(opts)
            questions.append(
                {
                    "type": "listen_identify",
                    "verse_id": vid,
                    "audio": verse["audio"],
                    "options": [
                        {"id": o["id"], "label": o["hindi"][:60]}
                        for o in opts
                    ],
                    "correct_id": vid,
                }
            )

    if verse.get("meaning_english"):
        questions.append(
            {
                "type": "memory_match",
                "verse_id": vid,
                "pair_a": verse["hindi"][:50],
                "pair_b": verse["meaning_english"][:80],
            }
        )

    return questions


@router.get("")
def list_games(learned: Optional[str] = Query(None)):
    learned_ids = _parse_learned(learned)
    all_verses = get_verses()
    valid_ids = {v["id"] for v in all_verses}
    learned_ids = {i for i in learned_ids if i in valid_ids}
    by_id = {v["id"]: v for v in all_verses}
    questions = []
    for vid in sorted(learned_ids):
        verse = by_id.get(vid)
        if verse:
            questions.extend(build_games_for_verse(verse, all_verses))
    return {"learned_ids": sorted(learned_ids), "questions": questions}
