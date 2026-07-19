"""Load and inject the existing Claude Code agent/skill/data content.

Everything the swarm knows comes from the same files the Claude Code config uses:
`.claude/agents/*.md`, `.claude/skills/*/SKILL.md`, and `synthetic-data/*`. We read
them at runtime so the SDK build stays a faithful port rather than a fork.
"""

from __future__ import annotations

import os
from pathlib import Path

# task07-claude-code-rfp-agent/ — parent of this package. All relative paths (RFP,
# outputs, agent Read/Write) resolve against this so the run is location-independent.
TASK_DIR = Path(__file__).resolve().parent.parent


def within_task_dir(path: str) -> bool:
    """True if `path` resolves inside TASK_DIR (blocks `..` / absolute escapes)."""
    target = path if os.path.isabs(path) else os.path.join(str(TASK_DIR), path)
    root = os.path.realpath(str(TASK_DIR))
    resolved = os.path.realpath(target)
    return resolved == root or resolved.startswith(root + os.sep)


def strip_frontmatter(text: str) -> str:
    """Drop a leading YAML `--- ... ---` frontmatter block, if present."""
    if text.startswith("---"):
        end = text.find("\n---", 3)
        if end != -1:
            nl = text.find("\n", end + 1)
            if nl != -1:
                return text[nl + 1 :].lstrip("\n")
    return text


def read(relpath: str) -> str:
    """Read a file relative to the task directory."""
    return (TASK_DIR / relpath).read_text(encoding="utf-8")


def load_agent_prompt(name: str) -> str:
    """System-prompt body of `.claude/agents/<name>.md` (frontmatter removed)."""
    return strip_frontmatter(read(f".claude/agents/{name}.md")).strip()


def load_skill(name: str) -> str:
    """Body of `.claude/skills/<name>/SKILL.md` (frontmatter removed)."""
    return strip_frontmatter(read(f".claude/skills/{name}/SKILL.md")).strip()


def load_data(relpath: str) -> str:
    """Raw synthetic-data file content."""
    return read(f"synthetic-data/{relpath}").strip()


def inject(base_prompt: str, *sections: tuple[str, str]) -> str:
    """Append injected reference sections to an agent's ported system prompt."""
    parts = [base_prompt]
    for title, body in sections:
        parts.append(f"\n\n---\n\n# Injected reference: {title}\n\n{body}")
    return "".join(parts)
