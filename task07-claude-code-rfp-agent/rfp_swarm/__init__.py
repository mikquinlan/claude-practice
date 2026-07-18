"""RFP Deal Desk swarm — Claude Agent SDK reimplementation of the Task07 Claude Code config.

A COORDINATOR agent (top-level query) fans out to five specialist workers
(pricing, legal, technical_fit, competitive, risk_assessment), synthesises their
findings into a branded proposal .docx, and commissions an internal risk HTML.

Source of truth is the existing `.claude/agents/*.md` + `.claude/skills/*/SKILL.md`
content, read at runtime and injected into each agent's prompt.
"""

from .context import TASK_DIR

__all__ = ["TASK_DIR"]
