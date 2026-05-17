"""Run before hackathon day: python scripts/verify_setup.py"""
import importlib
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

PACKAGES = [
    "streamlit",
    "fastapi",
    "openai",
    "pandas",
    "sklearn",
    "dotenv",
]

OPTIONAL = ["torch", "transformers", "cv2", "ultralytics"]


def check_env() -> bool:
    env_path = ROOT / ".env"
    if not env_path.exists():
        print("[WARN] No .env file — copy .env.example to .env")
        return False
    from dotenv import load_dotenv

    load_dotenv(env_path)
    keys = ["OPENAI_API_KEY", "ANTHROPIC_API_KEY", "HF_TOKEN"]
    ok = True
    for k in keys:
        v = os.getenv(k, "")
        if v and not v.endswith("..."):
            print(f"[OK] {k} is set")
        else:
            print(f"[--] {k} missing or placeholder")
            if k == "OPENAI_API_KEY":
                ok = False
    return ok


def check_imports(names: list[str], label: str) -> None:
    print(f"\n--- {label} ---")
    for name in names:
        try:
            importlib.import_module(name.replace("-", "_") if name == "dotenv" else name)
            print(f"[OK] {name}")
        except ImportError:
            print(f"[FAIL] {name}")


def test_openai() -> None:
    if not os.getenv("OPENAI_API_KEY") or os.getenv("OPENAI_API_KEY", "").endswith("..."):
        print("\n[SKIP] OpenAI live test (no key)")
        return
    print("\n--- OpenAI live test ---")
    try:
        import openai

        client = openai.OpenAI()
        r = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4o-mini"),
            messages=[{"role": "user", "content": "Reply with exactly: hackathon-ready"}],
            max_tokens=20,
        )
        text = (r.choices[0].message.content or "").strip()
        print(f"[OK] API responded: {text[:60]}")
    except Exception as e:
        print(f"[FAIL] OpenAI: {e}")


def main() -> None:
    os.chdir(ROOT)
    print(f"Project root: {ROOT}\n")
    check_env()
    check_imports(PACKAGES, "Core packages")
    check_imports(OPTIONAL, "Optional (vision/heavy)")
    test_openai()
    print("\nDone. Fix any [FAIL] before Saturday.")


if __name__ == "__main__":
    main()
