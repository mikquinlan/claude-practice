"""CLI entry point: `python -m rfp_swarm --rfp synthetic-data/rfp-acme-corp.md`."""

from __future__ import annotations

import argparse
import asyncio
import datetime as _dt
import os
import sys

from dotenv import load_dotenv

from .context import TASK_DIR
from .swarm import print_cost_summary, run_swarm, verify_artifacts


def _default_date() -> str:
    return _dt.date.today().isoformat()


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    p = argparse.ArgumentParser(prog="rfp_swarm", description="RFP deal-desk swarm (Claude Agent SDK).")
    p.add_argument("--rfp", default="synthetic-data/rfp-acme-corp.md", help="Path to the RFP markdown (relative to the task dir).")
    p.add_argument("--customer", default="Acme Corp", help="Customer name used in output filenames and branding.")
    p.add_argument("--date", default=_default_date(), help="Proposal date (YYYY-MM-DD). Defaults to today.")
    p.add_argument("--out-dir", default="outputs/rfp_swarm", help="Output directory (relative to the task dir).")
    p.add_argument("--model", default="sonnet", help="Coordinator model (workers set their own).")
    return p.parse_args(argv)


async def _amain(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    load_dotenv(TASK_DIR / ".env")
    load_dotenv()  # also honour a repo-root or ambient .env

    if not os.environ.get("ANTHROPIC_API_KEY"):
        print("ERROR: ANTHROPIC_API_KEY not set (put it in .env or the environment).", file=sys.stderr)
        return 2

    print(f"RFP swarm starting — customer={args.customer!r} date={args.date} model={args.model}")
    print(f"  RFP: {args.rfp}")
    print("-" * 60)

    res = await run_swarm(
        rfp_path=args.rfp,
        customer=args.customer,
        date=args.date,
        out_dir=args.out_dir,
        model=args.model,
    )

    print("\nARTIFACT VERIFICATION")
    ok = verify_artifacts(res)
    print_cost_summary(res)
    return 0 if ok else 1


def main() -> None:
    raise SystemExit(asyncio.run(_amain()))


if __name__ == "__main__":
    main()
