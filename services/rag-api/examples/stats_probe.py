"""
Probe /stats repeatedly to detect multi-instance / non-shared state.

Usage:
  python examples/stats_probe.py --url https://your-rag-api.example.com --count 20
"""

from __future__ import annotations

import argparse
import json
import time
import urllib.error
import urllib.request


def fetch_json(url: str, timeout_s: float = 10.0) -> dict:
    req = urllib.request.Request(
        url,
        method="GET",
        headers={"Accept": "application/json", "Cache-Control": "no-store"},
    )
    with urllib.request.urlopen(req, timeout=timeout_s) as resp:
        raw = resp.read().decode("utf-8")
        return json.loads(raw)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL for the API (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--count",
        type=int,
        default=20,
        help="Number of requests to make (default: 20)",
    )
    parser.add_argument(
        "--sleep-ms",
        type=int,
        default=200,
        help="Delay between requests (default: 200ms)",
    )
    args = parser.parse_args()

    base = args.url.rstrip("/")
    stats_url = f"{base}/stats"

    seen = {}
    for i in range(args.count):
        try:
            data = fetch_json(stats_url)
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"{i+1:02d}/{args.count}: ERROR {e}")
            time.sleep(args.sleep_ms / 1000.0)
            continue

        instance_id = str(data.get("instance_id", "unknown"))
        vector_count = data.get("vector_count", None)
        vector_db_path = data.get("vector_db_path", None)
        collection = data.get("collection", data.get("collection_name", None))

        key = (instance_id, vector_db_path, collection)
        seen[key] = seen.get(key, 0) + 1

        print(
            f"{i+1:02d}/{args.count}: "
            f"instance_id={instance_id} vector_count={vector_count} "
            f"collection={collection} vector_db_path={vector_db_path}"
        )
        time.sleep(args.sleep_ms / 1000.0)

    if len(seen) > 1:
        print("\nDetected multiple distinct instances/storage configs:")
        for (instance_id, vector_db_path, collection), n in sorted(seen.items(), key=lambda x: -x[1]):
            print(f"- hits={n} instance_id={instance_id} collection={collection} vector_db_path={vector_db_path}")
        return 2

    print("\nSingle instance/storage signature detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

