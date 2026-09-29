"""Check portable links and machine-readable artifacts in the case repository."""

from __future__ import annotations

import json
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote


ROOT = Path(__file__).resolve().parents[1]
errors: list[str] = []
checked_links = 0


def check_link(path: Path, value: str) -> None:
    global checked_links
    value = value.strip().strip("<>")
    if not value or value.startswith(("#", "http://", "https://", "mailto:", "data:", "javascript:")):
        return
    target = unquote(value.split("#", 1)[0].split("?", 1)[0])
    if not target:
        return
    checked_links += 1
    resolved = (path.parent / target).resolve()
    if not resolved.is_relative_to(ROOT) or not resolved.exists():
        errors.append(f"{path.relative_to(ROOT)} -> {value}")


for path in ROOT.rglob("*.md"):
    content = path.read_text(encoding="utf-8")
    for value in re.findall(r"\]\(([^)\n]+)\)", content):
        check_link(path, value)

for path in ROOT.glob("prototype/*.html"):
    content = path.read_text(encoding="utf-8")
    for value in re.findall(r"\b(?:src|href)=[\"']([^\"']+)[\"']", content):
        check_link(path, value)

for path in ROOT.glob("prototype/*.css"):
    content = path.read_text(encoding="utf-8")
    for value in re.findall(r"url\([\"']?([^\"')]+)", content):
        check_link(path, value)

json.loads((ROOT / "docs/api/openapi.json").read_text(encoding="utf-8"))
for path in (ROOT / "docs/processes/bpmn").glob("*.bpmn"):
    ET.parse(path)

if errors:
    print("Broken local links:")
    print("\n".join(errors))
    sys.exit(1)

print(f"OK: {checked_links} local links, OpenAPI JSON, BPMN XML")
