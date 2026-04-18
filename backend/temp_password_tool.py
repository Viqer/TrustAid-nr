#!/usr/bin/env python3
"""
Temporary password helper for local development.

What this does:
- Verify a plaintext password against a bcrypt hash.
- Generate a bcrypt hash for a new password.
- Reset a user's password in MongoDB by email.

What this cannot do:
- Decrypt bcrypt hashes. Bcrypt is intentionally one-way.

Usage examples:
  python temp_password_tool.py verify --plain "MyPass123" --hash "$2b$10$..."
  python temp_password_tool.py hash --plain "MyPass123"
  python temp_password_tool.py reset --email "user@example.com" --new-password "MyPass123"
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path
from typing import Dict

import bcrypt
from pymongo import MongoClient


DEFAULT_ENV_PATH = Path(__file__).resolve().parent / ".env"


def load_dotenv(path: Path) -> Dict[str, str]:
    """Lightweight .env loader to avoid extra dependencies."""
    env: Dict[str, str] = {}

    if not path.exists():
        return env

    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        env[key] = value

    return env


def get_mongodb_uri() -> str:
    env_values = load_dotenv(DEFAULT_ENV_PATH)
    return os.getenv("MONGODB_URI") or env_values.get("MONGODB_URI", "mongodb://localhost:27017/trustaid")


def cmd_verify(plain: str, hashed: str) -> int:
    try:
        ok = bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError as exc:
        print(f"Invalid hash format: {exc}")
        return 1

    if ok:
        print("Match: plaintext password is correct for this hash.")
        return 0

    print("No match: plaintext password does not match this hash.")
    return 2


def cmd_hash(plain: str, rounds: int) -> int:
    if rounds < 4 or rounds > 31:
        print("Rounds must be between 4 and 31.")
        return 1

    salt = bcrypt.gensalt(rounds)
    hashed = bcrypt.hashpw(plain.encode("utf-8"), salt).decode("utf-8")
    print(hashed)
    return 0


def cmd_reset(email: str, new_password: str, rounds: int) -> int:
    uri = get_mongodb_uri()
    client = MongoClient(uri)

    try:
        db = client.get_default_database()
        if db is None:
            db_name = uri.rsplit("/", 1)[-1].split("?", 1)[0] or "trustaid"
            db = client[db_name]

        users = db["users"]

        user = users.find_one({"email": email.lower().strip()})
        if not user:
            print(f"User not found for email: {email}")
            return 3

        new_hash = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt(rounds)).decode("utf-8")
        result = users.update_one({"_id": user["_id"]}, {"$set": {"password": new_hash}})

        if result.modified_count == 1:
            print("Password reset successful.")
            return 0

        print("Password was not changed (possibly same hash or write issue).")
        return 4
    finally:
        client.close()


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Temporary bcrypt password helper.")
    sub = parser.add_subparsers(dest="command", required=True)

    verify_parser = sub.add_parser("verify", help="Verify plain password against bcrypt hash")
    verify_parser.add_argument("--plain", required=True, help="Plaintext password to test")
    verify_parser.add_argument("--hash", required=True, dest="hashed", help="Stored bcrypt hash")

    hash_parser = sub.add_parser("hash", help="Generate bcrypt hash for a plain password")
    hash_parser.add_argument("--plain", required=True, help="Plaintext password")
    hash_parser.add_argument("--rounds", type=int, default=10, help="Bcrypt rounds (default: 10)")

    reset_parser = sub.add_parser("reset", help="Reset user password in MongoDB by email")
    reset_parser.add_argument("--email", required=True, help="User email")
    reset_parser.add_argument("--new-password", required=True, help="New plaintext password")
    reset_parser.add_argument("--rounds", type=int, default=10, help="Bcrypt rounds (default: 10)")

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()

    if args.command == "verify":
        return cmd_verify(args.plain, args.hashed)
    if args.command == "hash":
        return cmd_hash(args.plain, args.rounds)
    if args.command == "reset":
        return cmd_reset(args.email, args.new_password, args.rounds)

    parser.print_help()
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
