# One-time setup (PowerShell). Run from repo root: .\scripts\setup.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host "Creating venv..."
python -m venv .venv
.\.venv\Scripts\Activate.ps1

Write-Host "Installing core packages (this may take a few minutes)..."
pip install --upgrade pip
pip install -r requirements.txt

if (-not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "Created .env from .env.example — ADD YOUR API KEYS before Saturday."
}

Write-Host "`nOptional: PyTorch CPU (large download)"
Write-Host "  pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu"

Write-Host "`nVerify:"
Write-Host "  python scripts/verify_setup.py"
Write-Host "`nRun demo UI:"
Write-Host "  streamlit run frontend/streamlit_openai_app.py"
