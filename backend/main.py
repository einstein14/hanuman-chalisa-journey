from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from backend.routes import games, journey, sections, stories, verses

ROOT = Path(__file__).resolve().parent.parent
STATIC = ROOT / "static"

app = FastAPI(title="My Hanuman Chalisa Journey")

app.include_router(verses.router)
app.include_router(stories.router)
app.include_router(games.router)
app.include_router(journey.router)
app.include_router(sections.router)


@app.get("/health")
def health():
    return {"status": "ok"}


if STATIC.exists():
    app.mount("/", StaticFiles(directory=str(STATIC), html=True), name="static")
