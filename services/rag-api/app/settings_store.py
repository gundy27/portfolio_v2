"""SQLite-backed app settings store (minimal, v1).

Stores small JSON blobs in the existing metadata.db so settings persist across restarts.
"""

from __future__ import annotations

import asyncio
import json
import sqlite3
from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Dict, Optional


def _sqlite_path_from_url(url: str) -> str:
    # Expected: sqlite+aiosqlite:///./metadata.db
    # Also allow: sqlite:///./metadata.db
    if url.startswith("sqlite+aiosqlite:///"):
        return url.removeprefix("sqlite+aiosqlite:///")
    if url.startswith("sqlite:///"):
        return url.removeprefix("sqlite:///")
    raise ValueError(f"Unsupported metadata_db_url scheme: {url}")


DEFAULT_CHAT_SETTINGS: Dict[str, Any] = {
    "top_k": 5,
    "model": "gpt-4o-mini",
    "streaming": True,
}


@dataclass(frozen=True)
class ChatSettingsRow:
    value: Dict[str, Any]
    updated_at: str


class SettingsStore:
    def __init__(self, metadata_db_url: str):
        self._db_path = _sqlite_path_from_url(metadata_db_url)
        self._init_lock = asyncio.Lock()
        self._initialized = False

    async def _ensure_initialized(self) -> None:
        if self._initialized:
            return
        async with self._init_lock:
            if self._initialized:
                return
            await asyncio.to_thread(self._init_sync)
            self._initialized = True

    def _init_sync(self) -> None:
        conn = sqlite3.connect(self._db_path)
        try:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS app_settings (
                  key TEXT PRIMARY KEY,
                  value_json TEXT NOT NULL,
                  updated_at TEXT NOT NULL
                )
                """
            )
            conn.commit()
        finally:
            conn.close()

    async def get_chat_settings(self) -> ChatSettingsRow:
        await self._ensure_initialized()
        row = await asyncio.to_thread(self._get_sync, "chat")
        if not row:
            now = datetime.now(timezone.utc).isoformat()
            return ChatSettingsRow(value=dict(DEFAULT_CHAT_SETTINGS), updated_at=now)

        value_json, updated_at = row
        try:
            parsed = json.loads(value_json) if value_json else {}
        except Exception:
            parsed = {}

        merged = dict(DEFAULT_CHAT_SETTINGS)
        if isinstance(parsed, dict):
            merged.update(parsed)

        return ChatSettingsRow(value=merged, updated_at=updated_at)

    async def set_chat_settings(self, settings: Dict[str, Any]) -> ChatSettingsRow:
        await self._ensure_initialized()
        now = datetime.now(timezone.utc).isoformat()
        merged = dict(DEFAULT_CHAT_SETTINGS)
        merged.update(settings)
        await asyncio.to_thread(self._upsert_sync, "chat", json.dumps(merged), now)
        return ChatSettingsRow(value=merged, updated_at=now)

    def _get_sync(self, key: str) -> Optional[tuple[str, str]]:
        conn = sqlite3.connect(self._db_path)
        try:
            cur = conn.execute(
                "SELECT value_json, updated_at FROM app_settings WHERE key = ?",
                (key,),
            )
            return cur.fetchone()
        finally:
            conn.close()

    def _upsert_sync(self, key: str, value_json: str, updated_at: str) -> None:
        conn = sqlite3.connect(self._db_path)
        try:
            conn.execute(
                """
                INSERT INTO app_settings(key, value_json, updated_at)
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET
                  value_json=excluded.value_json,
                  updated_at=excluded.updated_at
                """,
                (key, value_json, updated_at),
            )
            conn.commit()
        finally:
            conn.close()

