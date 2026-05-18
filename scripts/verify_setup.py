"""Run before the demo: python scripts/verify_setup.py"""
from __future__ import annotations

import importlib
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))

REQUIRED_BASE_PACKAGES = [
    "dotenv",
    "fastapi",
    "httpx",
    "pydantic",
    "uvicorn",
]

OPTIONAL_GROUPS = {
    "Streamlit demos": ["streamlit"],
    "OpenAI starter demos": ["openai"],
    "Data demos": ["numpy", "pandas", "sklearn"],
    "Vision/heavy demos": ["torch", "transformers", "cv2", "ultralytics"],
}

PROVIDER_PACKAGES = {
    "anthropic": ["anthropic"],
    "gemini": ["google.genai"],
}

PROVIDER_KEY_OPTIONS = {
    "anthropic": {
        "a": ["ANTHROPIC_AGENT_A_API_KEY", "ANTHROPIC_API_KEY"],
        "b": ["ANTHROPIC_AGENT_B_API_KEY", "ANTHROPIC_AGENT_BC_API_KEY", "ANTHROPIC_API_KEY"],
        "c": ["ANTHROPIC_AGENT_C_API_KEY", "ANTHROPIC_AGENT_BC_API_KEY", "ANTHROPIC_API_KEY"],
        "d": ["ANTHROPIC_AGENT_D_API_KEY", "ANTHROPIC_API_KEY"],
    },
    "gemini": {
        "a": ["GEMINI_AGENT_A_API_KEY", "GEMINI_API_KEY"],
        "b": ["GEMINI_AGENT_B_API_KEY", "GEMINI_API_KEY"],
        "c": ["GEMINI_AGENT_C_API_KEY", "GEMINI_API_KEY"],
        "d": ["GEMINI_AGENT_D_API_KEY", "GEMINI_API_KEY"],
    },
}


def _configured(name: str) -> bool:
    value = os.getenv(name, "").strip()
    if not value:
        return False
    placeholder_tokens = ("...", "REPLACE_ME", "YOUR_", "PASTE_")
    return not any(token in value for token in placeholder_tokens)


def _import_ok(name: str) -> bool:
    try:
        importlib.import_module(name)
        return True
    except ImportError:
        return False


def check_env() -> bool:
    env_path = ROOT / ".env"
    if not env_path.exists():
        print("[FAIL] .env is missing. Copy .env.example to .env and add provider keys.")
        return False

    from dotenv import load_dotenv

    load_dotenv(env_path, override=True)
    if os.getenv("TRUTHNET_MOCK", "").strip().lower() in {"1", "true", "yes", "on"}:
        print("[OK] TRUTHNET_MOCK is enabled; live provider keys are not required.")
        return True

    ok = True
    agent_names = {
        "a": "AGENT_A_PROVIDER",
        "b": "AGENT_B_PROVIDER",
        "c": "AGENT_C_PROVIDER",
        "d": "AGENT_D_PROVIDER",
    }

    print("\n--- Provider keys ---")
    for agent, env_name in agent_names.items():
        provider = os.getenv(env_name, "anthropic").strip().lower()
        key_options = PROVIDER_KEY_OPTIONS.get(provider)
        if not key_options:
            print(f"[FAIL] Agent {agent.upper()} provider '{provider}' is unsupported")
            ok = False
            continue

        accepted_keys = key_options[agent]
        if any(_configured(name) for name in accepted_keys):
            print(f"[OK] Agent {agent.upper()} {provider} key is configured")
        else:
            print(f"[FAIL] Agent {agent.upper()} needs one of: {', '.join(accepted_keys)}")
            ok = False

    if _configured("GOOGLE_FACT_CHECK_API_KEY"):
        print("[OK] Google Fact Check key is configured")
    else:
        print("[--] Google Fact Check key is optional but improves source lookup")

    return ok


def check_imports(names: list[str], label: str, required: bool) -> bool:
    print(f"\n--- {label} ---")
    ok = True
    for name in names:
        if _import_ok(name):
            print(f"[OK] {name}")
        else:
            status = "[FAIL]" if required else "[--]"
            print(f"{status} {name}")
            if required:
                ok = False
    return ok


def provider_packages() -> list[str]:
    providers = {
        os.getenv("AGENT_A_PROVIDER", "anthropic").strip().lower(),
        os.getenv("AGENT_B_PROVIDER", "anthropic").strip().lower(),
        os.getenv("AGENT_C_PROVIDER", "anthropic").strip().lower(),
        os.getenv("AGENT_D_PROVIDER", "anthropic").strip().lower(),
    }
    packages: list[str] = []
    for provider in sorted(providers):
        packages.extend(PROVIDER_PACKAGES.get(provider, []))
    return packages


def main() -> int:
    os.chdir(ROOT)
    print(f"Project root: {ROOT}")

    env_ok = check_env()
    imports_ok = check_imports(REQUIRED_BASE_PACKAGES, "Required backend packages", required=True)

    if os.getenv("TRUTHNET_MOCK", "").strip().lower() not in {"1", "true", "yes", "on"}:
        imports_ok = (
            check_imports(provider_packages(), "Required provider packages", required=True)
            and imports_ok
        )

    for label, packages in OPTIONAL_GROUPS.items():
        check_imports(packages, f"Optional: {label}", required=False)

    if env_ok and imports_ok:
        print("\nReady for backend mock/live execution.")
        return 0

    print("\nSetup has required failures. Install missing required packages or configure provider keys.")
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
