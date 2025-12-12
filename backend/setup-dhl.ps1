# Automatisches DHL Setup Script
# Dieses Script fügt die DHL API Credentials automatisch zur .env hinzu

Write-Host "🚀 DHL Paket API - Automatisches Setup" -ForegroundColor Green
Write-Host ""

$envFile = ".env"
$backupFile = ".env.backup"

# Backup erstellen
if (Test-Path $envFile) {
    Write-Host "📦 Erstelle Backup: $backupFile" -ForegroundColor Yellow
    Copy-Item $envFile $backupFile -Force
}

# DHL Credentials
$dhlCredentials = @"

# DHL Developer Portal API Credentials (Your App)
DHL_API_KEY=vG9kJvViuGP3BwLjeYKS4qUzazIlQIBu
DHL_API_SECRET=rW1HCm4BU7QANoIb
DHL_API_ENVIRONMENT=sandbox

# DHL API Base URLs
DHL_API_SANDBOX_URL=https://api-sandbox.dhl.com
DHL_API_PRODUCTION_URL=https://api-eu.dhl.com
"@

# Prüfen ob DHL Credentials bereits vorhanden
$envContent = Get-Content $envFile -Raw -ErrorAction SilentlyContinue

if ($envContent -match "DHL_API_KEY") {
    Write-Host "✅ DHL Credentials bereits vorhanden" -ForegroundColor Green
} else {
    Write-Host "➕ Füge DHL Credentials hinzu..." -ForegroundColor Cyan
    Add-Content -Path $envFile -Value $dhlCredentials
    Write-Host "✅ DHL Credentials hinzugefügt!" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ Setup abgeschlossen!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Nächste Schritte:" -ForegroundColor Yellow
Write-Host "1. Backend starten: npm run dev" -ForegroundColor White
Write-Host "2. Frontend öffnen: http://localhost:5173" -ForegroundColor White
Write-Host "3. Versandeinstellungen → DHL Paket" -ForegroundColor White
Write-Host "4. Sandbox-Test: user-valid / SandboxPasswort2023!" -ForegroundColor White
Write-Host ""
