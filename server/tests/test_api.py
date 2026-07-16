from unittest.mock import MagicMock

import pytest
from fastapi.testclient import TestClient

from app.dependencies import get_supabase
from app.main import app, get_current_user_id

USER_ID = "00000000-0000-0000-0000-000000000000"
OTHER_ID = "11111111-1111-1111-1111-111111111111"


@pytest.fixture(autouse=True)
def clear_overrides():
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_db():
    db = MagicMock()
    app.dependency_overrides[get_supabase] = lambda: db
    return db


@pytest.fixture
def authed(mock_db):
    """Authenticate every request as USER_ID."""
    app.dependency_overrides[get_current_user_id] = lambda: USER_ID
    return mock_db


class TestHealthCheck:
    def test_root_is_public(self, client):
        response = client.get("/")
        assert response.status_code == 200
        assert response.json()["status"] == "ok"


class TestAuth:
    def test_missing_authorization_header_is_rejected(self, client, mock_db):
        assert client.get(f"/user/progress/{USER_ID}").status_code == 422

    def test_non_bearer_scheme_is_rejected(self, client, mock_db):
        response = client.get(
            f"/user/progress/{USER_ID}",
            headers={"Authorization": "Basic abc123"},
        )
        assert response.status_code == 401
        # the token must never reach supabase
        mock_db.auth.get_user.assert_not_called()

    def test_invalid_token_is_rejected(self, client, mock_db):
        mock_db.auth.get_user.side_effect = Exception("bad token")
        response = client.get(
            f"/user/progress/{USER_ID}",
            headers={"Authorization": "Bearer garbage"},
        )
        assert response.status_code == 401

    def test_token_without_user_is_rejected(self, client, mock_db):
        mock_db.auth.get_user.return_value = MagicMock(user=None)
        response = client.get(
            f"/user/progress/{USER_ID}",
            headers={"Authorization": "Bearer expired"},
        )
        assert response.status_code == 401

    def test_valid_token_resolves_to_its_user(self, client, mock_db):
        mock_db.auth.get_user.return_value = MagicMock(user=MagicMock(id=USER_ID))
        chain = mock_db.table.return_value.select.return_value.eq.return_value.eq.return_value
        chain.execute.return_value.data = []

        response = client.get(
            f"/user/progress/{USER_ID}",
            headers={"Authorization": "Bearer valid-token"},
        )
        assert response.status_code == 200
        mock_db.auth.get_user.assert_called_once_with("valid-token")


class TestProgress:
    def test_cannot_read_another_users_progress(self, client, authed):
        response = client.get(f"/user/progress/{OTHER_ID}")
        assert response.status_code == 403

    def test_new_user_gets_empty_progress(self, client, authed):
        chain = authed.table.return_value.select.return_value.eq.return_value.eq.return_value
        chain.execute.return_value.data = []

        response = client.get(f"/user/progress/{USER_ID}")
        assert response.status_code == 200
        assert response.json() == {
            "completed_lessons": [],
            "average_wpm": 0,
            "average_accuracy": 0,
        }

    def test_aggregates_deduped_lessons_and_means(self, client, authed):
        chain = authed.table.return_value.select.return_value.eq.return_value.eq.return_value
        chain.execute.return_value.data = [
            {"lesson_id": "1.1.1", "wpm": 30, "accuracy": 90},
            {"lesson_id": "1.1.1", "wpm": 50, "accuracy": 100},
            {"lesson_id": "1.1.2", "wpm": None, "accuracy": None},  # bad row tolerated
        ]

        response = client.get(f"/user/progress/{USER_ID}")
        body = response.json()
        assert sorted(body["completed_lessons"]) == ["1.1.1", "1.1.2"]
        assert body["average_wpm"] == 40.0
        assert body["average_accuracy"] == 95.0

    def test_only_verified_attempts_are_counted(self, client, authed):
        select = authed.table.return_value.select.return_value
        select.eq.return_value.eq.return_value.execute.return_value.data = []

        client.get(f"/user/progress/{USER_ID}")

        select.eq.assert_called_once_with("user_id", USER_ID)
        select.eq.return_value.eq.assert_called_once_with("verified", True)


class TestLessons:
    LESSON = {
        "id": "1.1.1",
        "title": "Right Hand Vowels",
        "description": "Start with the four basic vowels",
        "phase": "foundation",
        "unit": 1,
        "lesson_number": 1,
        "difficulty": 1,
        "order_index": 0,
        "content_json": {"targetText": "ㅗ ㅓ", "instructions": "", "focusKeys": []},
    }

    def test_lessons_are_public_and_ordered(self, client, mock_db):
        chain = mock_db.table.return_value.select.return_value.order.return_value
        chain.execute.return_value.data = [self.LESSON]

        response = client.get("/lessons")
        assert response.status_code == 200
        assert response.json()[0]["id"] == "1.1.1"
        mock_db.table.return_value.select.return_value.order.assert_called_once_with(
            "order_index"
        )


class TestRecordAttempt:
    PAYLOAD = {
        "lesson_id": "1.1.1",
        "start_time": 1_000,
        "end_time": 61_000,
        "total_keystrokes": 100,
        "error_count": 5,
    }

    def test_requires_auth(self, client, mock_db):
        assert client.post("/attempts", json=self.PAYLOAD).status_code == 422

    def test_user_id_comes_from_token_not_body(self, client, authed):
        insert = authed.table.return_value.insert
        insert.return_value.execute.return_value.data = [{"id": 1}]

        # a spoofed user_id in the body must be ignored
        response = client.post(
            "/attempts", json={**self.PAYLOAD, "user_id": OTHER_ID}
        )
        assert response.status_code == 200

        inserted = insert.call_args.args[0]
        assert inserted["user_id"] == USER_ID

    def test_computes_and_stores_derived_metrics(self, client, authed):
        insert = authed.table.return_value.insert
        insert.return_value.execute.return_value.data = [{"id": 1}]

        response = client.post("/attempts", json=self.PAYLOAD)
        assert response.status_code == 200
        assert response.json()["status"] == "success"

        inserted = insert.call_args.args[0]
        assert inserted["wpm"] == 20
        assert inserted["accuracy"] == 95.0
        assert inserted["duration_seconds"] == 60.0
        assert inserted["verified"] is True

    def test_rejects_invalid_timing(self, client, authed):
        bad = {**self.PAYLOAD, "end_time": 500}
        assert client.post("/attempts", json=bad).status_code == 422
