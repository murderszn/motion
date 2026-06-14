<#
  deploy.ps1 — publish splash.html to Firebase Hosting (project motion-e93d3).

  The splash lives at the repo root (splash.html) and is served as the site root
  via the rewrite in firebase.json. No copy/staging step is needed.

  Usage:
    .\deploy.ps1            # deploy the splash to Firebase Hosting
    .\deploy.ps1 -Push      # also commit & push splash.html to origin/main first
#>
[CmdletBinding()]
param(
    [switch]$Push
)

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

if ($Push) {
    git add splash.html firebase.json .firebaserc
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m "Update splash page"
        git push origin main
    } else {
        Write-Host "Nothing staged to commit; skipping push." -ForegroundColor Yellow
    }
}

Write-Host "Deploying splash to Firebase Hosting (motion-e93d3)..." -ForegroundColor Cyan
firebase deploy --only hosting --project motion-e93d3

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nLive: https://motion-e93d3.web.app" -ForegroundColor Green
} else {
    Write-Host "`nDeploy failed (exit $LASTEXITCODE). If this is an auth error, run: firebase login --reauth" -ForegroundColor Red
    exit $LASTEXITCODE
}
