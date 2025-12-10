Write-Host "NFC Tool Setup Script" -ForegroundColor Cyan
Write-Host "====================="

# Check Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js is not installed. Please install Node.js first."
    exit 1
}

# Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python is not installed. Please install Python first."
    exit 1
}

# Install Node dependencies
Write-Host "`n[1/2] Installing Node.js dependencies..." -ForegroundColor Yellow
try {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install failed" }
    Write-Host "Done." -ForegroundColor Green
} catch {
    Write-Error "Failed to install Node.js dependencies."
    exit 1
}

# Install Python dependencies
Write-Host "`n[2/2] Installing Python dependencies..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) { throw "pip install failed" }
    Write-Host "Done." -ForegroundColor Green
} catch {
    Write-Error "Failed to install Python dependencies."
    exit 1
}

Write-Host "`nSetup completed successfully!" -ForegroundColor Cyan
Write-Host "To start the application, run: npm start" -ForegroundColor White

