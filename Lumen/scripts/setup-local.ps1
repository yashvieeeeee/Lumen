$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
$pgBin = 'C:\Program Files\PostgreSQL\18\bin'
if (-not (Test-Path -LiteralPath "$pgBin\initdb.exe")) { throw 'Install PostgreSQL 18 binaries first; see docs/LOCAL_DEVELOPMENT.md.' }
New-Item -ItemType Directory -Force -Path '.tools', 'apps/web' | Out-Null
$privateToolsPath = Join-Path $projectRoot '.tools'
# Restrict cluster files and logs as well as credentials, including existing children.
& icacls $privateToolsPath /inheritance:r /grant:r "$($env:USERNAME):(F)" /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Failed to restrict local database-directory permissions.' }
# Files need a direct access grant; inheritable-only flags apply to directories.
& icacls $privateToolsPath /grant:r "$($env:USERNAME):(OI)(CI)(F)" /Q | Out-Null
& icacls "$privateToolsPath\*" /inheritance:e /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Failed to propagate private directory permissions.' }
function New-LocalSecret { [Convert]::ToHexString([Security.Cryptography.RandomNumberGenerator]::GetBytes(32)).ToLowerInvariant() }
if (-not (Test-Path -LiteralPath '.env.local')) {
    $adminPassword = New-LocalSecret
    $appPassword = New-LocalSecret
    $receiptKey = New-LocalSecret
    @"
DATABASE_URL=postgresql+asyncpg://lumen_app:${appPassword}@127.0.0.1:55432/lumen
DATABASE_MIGRATION_URL=postgresql+asyncpg://lumen_admin:${adminPassword}@127.0.0.1:55432/lumen
RECEIPT_KEY=$receiptKey
WEB_ORIGIN=http://localhost:3180
COOKIE_SECURE=false
DEVELOPMENT=true
LUMEN_API_URL=http://127.0.0.1:8060
"@ | Set-Content -LiteralPath '.env.local' -Encoding utf8
    $adminPassword | Set-Content -LiteralPath '.tools/pg-password' -Encoding ascii
    foreach ($secretFile in @('.env.local', '.tools/pg-password')) {
        & icacls $secretFile /inheritance:r /grant:r "$($env:USERNAME):(F)" | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Failed to restrict secret-file permissions.' }
    }
}
if (-not (Test-Path -LiteralPath '.tools/pg-data/PG_VERSION')) {
    & "$pgBin\initdb.exe" -D '.tools/pg-data' -U lumen_admin --auth=scram-sha-256 --encoding=UTF8 --locale=C --pwfile='.tools/pg-password'
    if ($LASTEXITCODE -ne 0) { throw 'Database initialization failed.' }
    Add-Content -LiteralPath '.tools/pg-data/postgresql.conf' -Value "`nlisten_addresses='127.0.0.1'`nport=55432`nlog_statement='none'`nlog_min_error_statement='panic'`nlog_parameter_max_length=0`nlog_parameter_max_length_on_error=0"
}
& "$pgBin\pg_ctl.exe" -D '.tools/pg-data' status *> $null
if ($LASTEXITCODE -ne 0) {
    # pg_ctl starts the server in the background without a separate visible terminal.
    & "$pgBin\pg_ctl.exe" -D '.tools/pg-data' -l '.tools/postgres.log' -w start
    if ($LASTEXITCODE -ne 0) { throw 'Lumen PostgreSQL startup failed.' }
}
Set-Location -LiteralPath "$projectRoot\services\api"
& uv sync --locked --python "$projectRoot\.tools\python\cpython-3.13.14-windows-x86_64-none\python.exe"
if ($LASTEXITCODE -ne 0) { throw 'Install project Python first: uv python install 3.13.14 --install-dir .tools/python --no-bin --no-registry' }
& uv run python ../../scripts/bootstrap-db.py
if ($LASTEXITCODE -ne 0) { throw 'Database role setup failed.' }
& uv run alembic upgrade head
if ($LASTEXITCODE -ne 0) { throw 'Database migration failed.' }
Set-Location -LiteralPath $projectRoot
@"
LUMEN_API_URL=http://127.0.0.1:8060
WEB_ORIGIN=http://localhost:3180
"@ | Set-Content -LiteralPath 'apps/web/.env.local' -Encoding utf8
Write-Output 'Local Lumen database and environment ready. Secrets were not printed.'
