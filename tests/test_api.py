from fastapi.testclient import TestClient

from backend.main import app

client = TestClient(app)


def test_index_html():
    res = client.get("/")
    assert res.status_code == 200
    assert "Hanuman" in res.text


def test_static_js():
    res = client.get("/js/app.js")
    assert res.status_code == 200
