import pytest
from pydantic import ValidationError

from app.models import AttemptCreate


def make_attempt(**overrides):
    defaults = {
        "lesson_id": "1.1.1",
        "start_time": 1_000,
        "end_time": 61_000,  # 60 seconds later
        "total_keystrokes": 100,
        "error_count": 5,
    }
    defaults.update(overrides)
    return AttemptCreate(**defaults)


class TestValidation:
    def test_end_time_must_be_after_start_time(self):
        with pytest.raises(ValidationError):
            make_attempt(end_time=1_000)
        with pytest.raises(ValidationError):
            make_attempt(end_time=500)

    def test_total_keystrokes_must_be_positive(self):
        with pytest.raises(ValidationError):
            make_attempt(total_keystrokes=0)

    def test_error_count_may_be_zero_but_not_negative(self):
        assert make_attempt(error_count=0).error_count == 0
        with pytest.raises(ValidationError):
            make_attempt(error_count=-1)


class TestDerivedMetrics:
    def test_duration_converts_milliseconds_to_seconds(self):
        assert make_attempt().duration_seconds == 60.0

    def test_wpm_uses_five_chars_per_word(self):
        # 100 keystrokes / 5 chars per word / 1 minute = 20 WPM
        assert make_attempt().wpm == 20

    def test_wpm_rounds_to_nearest_integer(self):
        # 104 keystrokes in 60s -> 20.8 -> rounds to 21 (matches client Math.round)
        assert make_attempt(total_keystrokes=104).wpm == 21

    def test_accuracy_is_error_ratio_percentage(self):
        assert make_attempt().accuracy == 95.0

    def test_accuracy_clamps_at_zero(self):
        assert make_attempt(error_count=200).accuracy == 0


class TestVerified:
    def test_normal_speed_is_verified(self):
        assert make_attempt().wpm == 20
        assert make_attempt().verified is True

    def test_superhuman_speed_is_flagged(self):
        # 1500 keystrokes in 60s = 300 WPM, above the 250 cheat threshold
        cheater = make_attempt(total_keystrokes=1_500)
        assert cheater.wpm == 300
        assert cheater.verified is False

    def test_threshold_is_exclusive_at_250(self):
        # exactly 250 WPM -> not verified (wpm < 250 required)
        at_limit = make_attempt(total_keystrokes=1_250)
        assert at_limit.wpm == 250
        assert at_limit.verified is False
