import pytest
from fastapi.testclient import TestClient

from app.main import app


class _StreamingCompatClient:
    """Compat wrapper: httpx TestClient doesn't accept stream= kwarg."""

    def __init__(self, inner: TestClient):
        self._inner = inner

    def __getattr__(self, name):
        return getattr(self._inner, name)

    def post(self, *args, **kwargs):
        kwargs.pop("stream", None)
        return self._inner.post(*args, **kwargs)


@pytest.fixture
def client() -> TestClient:
    return _StreamingCompatClient(TestClient(app))

