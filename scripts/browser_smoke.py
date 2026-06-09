"""Headless browser smoke test for TruthNet UI (with auth)."""
import httpx
from playwright.sync_api import sync_playwright

BASE = "http://127.0.0.1:8000"
errors: list[str] = []

# Register + login via API for reliable session cookie
email = "smoke_test@example.com"
password = "testpass1"
client = httpx.Client(base_url=BASE)

reg = client.post("/auth/register", json={"email": email, "password": password})
if reg.status_code == 400:
    client.post("/auth/login", json={"email": email, "password": password})
else:
    reg.raise_for_status()

cookies = dict(client.cookies)

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context()
    for name, value in cookies.items():
        context.add_cookies([{"name": name, "value": value, "domain": "127.0.0.1", "path": "/"}])
    page = context.new_page()
    page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
    page.on("console", lambda msg: errors.append(f"console: {msg.text}") if msg.type == "error" else None)

    page.goto(f"{BASE}/", wait_until="networkidle", timeout=30000)
    page.wait_for_selector("text=Real-time verdicts", timeout=15000)
    print("LANDING OK")

    page.goto(f"{BASE}/app", wait_until="networkidle")
    page.wait_for_selector("text=Truth, on trial.", timeout=15000)
    print("APP OK")

    page.fill("textarea", "The Great Wall is visible from the Moon")
    page.get_by_role("button", name="Submit for Fact-Check").click()
    page.wait_for_selector("text=End of judgment", timeout=40000)
    print("FACT-CHECK OK")

    if errors:
        print("ERRORS:")
        for err in errors:
            print(" ", err)
        raise SystemExit(1)

    browser.close()

print("ALL PASS")
