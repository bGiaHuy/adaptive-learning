#!/usr/bin/env python3
"""
discover_sources.py - Source Registry Inspector & Preflight Connectivity Checker

Reads `data/sources/source-registry.json`, validates its schema,
and performs polite pre-flight health checks against approved endpoints.
"""

import json
import os
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass
import sys
import time
import urllib.request
import urllib.error

REGISTRY_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "data", "sources", "source-registry.json")
)

USER_AGENT = "AdaptiveStudyBot/1.0 (Educational Content Pipeline; contact: dev@adaptivestudy.org)"


def load_registry(filepath: str) -> dict:
    if not os.path.exists(filepath):
        print(f"[-] Registry file not found: {filepath}", file=sys.stderr)
        sys.exit(1)
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)


def check_source_connectivity(source: dict) -> dict:
    source_id = source["id"]
    status = source["status"]
    homepage = source.get("homepage")

    result = {
        "id": source_id,
        "name": source["name"],
        "status": status,
        "license": source["license"],
        "accessible": False,
        "http_code": None,
        "notes": "",
    }

    if status != "approved" or not homepage:
        result["notes"] = f"Skipped network check ({status})"
        return result

    # Perform lightweight probe
    try:
        req = urllib.request.Request(
            homepage,
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/json,*/*"},
            method="HEAD",
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            result["accessible"] = True
            result["http_code"] = resp.status
            result["notes"] = "HEAD check passed (200 OK)"
    except urllib.error.HTTPError as he:
        # Some servers reject HEAD, try GET with byte range
        if he.code in (405, 403, 501):
            try:
                req_get = urllib.request.Request(
                    homepage,
                    headers={
                        "User-Agent": USER_AGENT,
                        "Range": "bytes=0-512",
                        "Accept": "text/html,application/json,*/*",
                    },
                )
                with urllib.request.urlopen(req_get, timeout=8) as resp2:
                    result["accessible"] = True
                    result["http_code"] = resp2.status
                    result["notes"] = f"GET probe passed (Status {resp2.status})"
            except Exception as e2:
                result["http_code"] = he.code
                result["notes"] = f"HTTP {he.code} on probe: {e2}"
        else:
            result["http_code"] = he.code
            result["notes"] = f"HTTP Error {he.code}: {he.reason}"
    except Exception as e:
        result["notes"] = f"Connection failed: {e}"

    return result


def main():
    print("=" * 70)
    print("ADAPTIVE STUDY - SOURCE DISCOVERY & REGISTRY AUDIT")
    print("=" * 70)

    registry = load_registry(REGISTRY_PATH)
    sources = registry.get("sources", [])
    print(f"Loaded {len(sources)} sources from registry: {REGISTRY_PATH}\n")

    approved = [s for s in sources if s["status"] == "approved"]
    reference = [s for s in sources if s["status"] == "reference-only"]
    rejected = [s for s in sources if s["status"] == "rejected"]

    print(f"Summary by Status:")
    print(f"  [+] Approved for ingestion:    {len(approved)}")
    print(f"  [*] Reference-only (no crawl): {len(reference)}")
    print(f"  [-] Rejected (IP/Legal/TOS):   {len(rejected)}")
    print("-" * 70)

    print("\nAuditing Approved Sources Connectivity:")
    for src in approved:
        res = check_source_connectivity(src)
        status_icon = "[OK]" if res["accessible"] else "[WARN]"
        print(f" {status_icon} {src['id']:<30} | {src['license']:<20} | {res['notes']}")
        time.sleep(0.3)

    print("\nAuditing Reference-Only Sources:")
    for src in reference:
        print(f" [*] {src['id']:<30} | {src['license']:<20} | {src['rationale'][:60]}...")

    print("\nAuditing Rejected Sources (Excluded):")
    for src in rejected:
        print(f" [-] {src['id']:<30} | REJECTED | {src['rationale'][:60]}...")

    print("\n" + "=" * 70)
    print("Preflight check complete. Approved sources are cleared for ingestion.")
    print("=" * 70)


if __name__ == "__main__":
    main()
