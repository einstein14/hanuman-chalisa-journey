# My Hanuman Chalisa Journey

A child-friendly web app (ages 5–8) to learn the traditional Hanuman Chalisa with Telugu and English support. Progress is stored in the browser only.

**GitHub:** https://github.com/einstein14/hanuman-chalisa-journey

## Run locally

```bash
cd /home/avima/hanuman
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
fastapi dev
```

Or with uvicorn directly:

```bash
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
- Chanting audio: `static/audio/*.m4a`

## API

- `GET /api/verses`, `GET /api/verses/{id}`
- `GET /api/stories`, `GET /api/stories/{id}`
- `GET /api/games?learned=1,2,3`
- `GET /api/journey`, `GET /api/sections`
- `GET /health`

## Deploy to FastAPI Cloud

The app entrypoint is configured in `pyproject.toml`:

```toml
[tool.fastapi]
entrypoint = "backend.main:app"
```

Leave **Application directory** empty in the dashboard (repo root). `data/` and `static/` must deploy with the app.

### Option A — Deploy from your machine (CLI)

```bash
cd /home/avima/hanuman
source .venv/bin/activate   # pip install -e ".[dev]" if needed
fastapi login               # complete browser / device login
fastapi deploy              # prints your live HTTPS URL
```

### Option B — Create app from GitHub (auto-deploy on push)

1. Sign in at [FastAPI Cloud](https://fastapicloud.com).
2. Create a new app → **GitHub repo** → select `einstein14/hanuman-chalisa-journey`.
3. **Application directory:** leave blank (repository root).
4. Default branch `main` — each push redeploys.

Docs: [GitHub integration](https://fastapicloud.com/docs/source-control/github-integration/).

### Option C — GitHub Actions (after first CLI deploy)

After `fastapi deploy` succeeds once:

```bash
fastapi cloud setup-ci
```

This adds deploy secrets and `.github/workflows/deploy.yml`. See [setup-ci](https://fastapicloud.com/docs/fastapi-cloud-cli/setup-ci/).

### Connect GitHub to an existing cloud app

Dashboard → your app → **Settings** → **Repository** → **Connect** → choose `hanuman-chalisa-journey`.
