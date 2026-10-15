$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path -LiteralPath "$projectRoot\apps\web\.next\BUILD_ID")) { throw 'Run npm run build in apps/web first.' }
if (-not (Test-Path -LiteralPath "$projectRoot\.env.local")) { throw 'Run scripts/setup-local.ps1 first.' }
$pgBin = 'C:\Program Files\PostgreSQL\18\bin'
if (Test-Path -LiteralPath "$pgBin\pg_ctl.exe") {
    & "$pgBin\pg_ctl.exe" -D "$projectRoot\.tools\pg-data" status *> $null
    if ($LASTEXITCODE -ne 0) {
        & "$pgBin\pg_ctl.exe" -D "$projectRoot\.tools\pg-data" -l "$projectRoot\.tools\postgres.log" -w start
        if ($LASTEXITCODE -ne 0) { throw 'Lumen PostgreSQL startup failed.' }
    }
}
foreach ($port in @(3180,8060)) {
    if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) { throw "Port $port is occupied. Use the running Lumen instance or stop its process before starting." }
}
$apiProcess = Start-Process -FilePath "$projectRoot\services\api\.venv\Scripts\python.exe" -ArgumentList @('-m','uvicorn','lumen_api.main:app','--app-dir','../..','--host','127.0.0.1','--port','8060','--no-access-log','--log-level','critical') -WorkingDirectory "$projectRoot\services\api" -WindowStyle Hidden -PassThru
$webProcess = Start-Process -FilePath (Get-Command node).Source -ArgumentList @('node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3180') -WorkingDirectory "$projectRoot\apps\web" -WindowStyle Hidden -PassThru
$startupTimer = [Diagnostics.Stopwatch]::StartNew()
$servicesReady = $false
while ($startupTimer.Elapsed.TotalSeconds -lt 15) {
    try {
        $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8060/health' -TimeoutSec 5
        $webResponse = Invoke-WebRequest -Uri 'http://localhost:3180' -TimeoutSec 5 -UseBasicParsing
        if ($health.scope -eq 'local-synthetic-foundation' -and $webResponse.StatusCode -eq 200) { $servicesReady = $true; break }
    } catch { }
    Start-Sleep -Milliseconds 250
}
if (-not $servicesReady) { throw 'Services did not become ready. Check the documented interactive startup commands.' }
# Windows virtualenv launchers can spawn a child; record the actual listening processes.
$apiListener = (Get-NetTCPConnection -LocalPort 8060 -State Listen).OwningProcess
$webListener = (Get-NetTCPConnection -LocalPort 3180 -State Listen).OwningProcess
@{ api = $apiListener; web = $webListener; started_at = (Get-Date).ToString('o') } | ConvertTo-Json | Set-Content -LiteralPath "$projectRoot\.tools\processes.json"
Write-Output "Lumen ready at http://localhost:3180 (API PID $apiListener, web PID $webListener)."
