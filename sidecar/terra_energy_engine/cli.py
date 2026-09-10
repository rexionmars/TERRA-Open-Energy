"""
One request in, one result out, then the process ends.
"""

from __future__ import annotations

import json
import platform
import sys

from terra_energy_engine import protocol, registry


def main() -> None:
    try:
        req = json.load(sys.stdin)
    except json.JSONDecodeError as e:
        protocol.fail(f'invalid request JSON: {e}')
    if not isinstance(req, dict):
        protocol.fail('the request must be a JSON object')
    action = req.get('action')
    if not isinstance(action, str):
        protocol.fail('the request names no action')
    registry.resolve(action)(req)


def ping(req: protocol.Request) -> None:
    """Health check: the interpreter starts and the package imports."""
    protocol.reply({'ok': True, 'python': platform.python_version()})
