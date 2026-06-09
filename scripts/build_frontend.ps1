# Compile frontend JSX to plain JS (no in-browser Babel needed at runtime).
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

if (-not (Test-Path "node_modules/@babel/cli/bin/babel.js")) {
    Write-Host "Installing Babel (one-time)..."
    npm install --no-save @babel/core@7.26.9 @babel/cli@7.26.4 @babel/preset-react@7.26.3
}

$files = @(
    "components.jsx",
    "plans.jsx",
    "quota.jsx",
    "app.jsx",
    "landing.jsx",
    "auth.jsx",
    "legal.jsx",
    "billing.jsx",
    "history.jsx",
    "router.jsx"
)

foreach ($file in $files) {
    $out = $file -replace "\.jsx$", ".bundle.js"
    Write-Host "Compiling $file -> frontend/$out"
    node node_modules/@babel/cli/bin/babel.js "frontend/$file" -o "frontend/$out" --presets=@babel/preset-react
}

Write-Host "Done."
