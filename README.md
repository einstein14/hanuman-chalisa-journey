# My Hanuman Chalisa Journey

A child-friendly web app (ages 5–8) to learn the traditional Hanuman Chalisa with Telugu and English support. Progress is stored in the browser only.

## Run locally

```bash
cd /home/avima/hanuman
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Open [http://localhost:8000](http://localhost:8000).

## Tests

```bash
pytest
```

## Content and audio

- Verse text: `data/hanuman_chalisa.json` (see `data/content_notes.md`)
- Stories: `data/stories.json`
- Add chanting MP3 files under `static/audio/` (see `static/audio/README.md`)

## API

- `GET /api/verses`, `GET /api/verses/{id}`
- `GET /api/stories`, `GET /api/stories/{id}`
- `GET /api/games?learned=1,2,3`
- `GET /api/journey`
- `GET /health`
