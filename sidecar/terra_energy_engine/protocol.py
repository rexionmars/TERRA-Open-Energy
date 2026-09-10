"""
The contract between the desktop shell and the sidecar.

One JSON request arrives on stdin. While the work runs, progress objects are
written to stderr, one per line: {"progress": 0-100, "msg": "..."}. The result
is written to stdout as a single JSON object. A failure writes {"error": "..."}
to stderr and exits with status 1.

Nothing else may write to stdout: the shell parses all of it as the result.
"""

from __future__ import annotations

import json
import sys
from typing import Any, NoReturn

Request = dict[str, Any]


def emit_progress(progress: int, msg: str) -> None:
    """Write one progress object to stderr. Use -1 for a message without a value."""
    sys.stderr.write(json.dumps({'progress': progress, 'msg': msg}) + '\n')
    sys.stderr.flush()


def reply(result: dict[str, Any]) -> None:
    """Write the result to stdout. Called once, at the end of an action."""
    sys.stdout.write(json.dumps(result))
    sys.stdout.flush()


def fail(msg: str) -> NoReturn:
    """Write an error to stderr and exit non-zero."""
    sys.stderr.write(json.dumps({'error': msg}) + '\n')
    sys.stderr.flush()
    sys.exit(1)
