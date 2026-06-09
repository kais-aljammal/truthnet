# Start TruthNet (PowerShell). Run from repo root: .\scripts\run.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "No .venv found. Run .\scripts\setup.ps1 first." -ForegroundColor Red
    exit 1
}

# Demo fixture = instant results, no API keys needed
if (-not $env:DEMO_MODE) { $env:DEMO_MODE = "true" }
if (-not $env:TRUTHNET_MOCK) { $env:TRUTHNET_MOCK = "1" }
if (-not $env:AUTH_REQUIRED) { $env:AUTH_REQUIRED = "false" }

if (-not (Test-Path "frontend/app.bundle.js")) {
    Write-Host "Building frontend bundles (first run)..." -ForegroundColor Yellow
    & "$Root\scripts\build_frontend.ps1"
}

Write-Host ""
Write-Host "TruthNet starting..." -ForegroundColor Cyan
Write-Host "  DEMO_MODE=$env:DEMO_MODE"
Write-Host "  Open:  http://127.0.0.1:8000/app" -ForegroundColor Green
Write-Host "  Stop:  Ctrl+C"
Write-Host ""

.\.venv\Scripts\uvicorn.exe backend.main:app --reload --host 127.0.0.1 --port 8000
