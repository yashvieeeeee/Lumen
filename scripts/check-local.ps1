$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $projectRoot
& python -m unittest evaluation.test_baseline -q
if ($LASTEXITCODE -ne 0) { throw 'Offline baseline check failed.' }
Set-Location -LiteralPath "$projectRoot\services\api"
& uv run ruff check lumen_api tests migrations ../../scripts/bootstrap-db.py ../../scripts/check-migrations.py
if ($LASTEXITCODE -ne 0) { throw 'Python lint failed.' }
& uv run ruff format --check lumen_api tests migrations ../../scripts/bootstrap-db.py ../../scripts/check-migrations.py
if ($LASTEXITCODE -ne 0) { throw 'Python format check failed.' }
& uv run pytest --cov=lumen_api --cov-branch --cov-fail-under=80 -q --tb=short
if ($LASTEXITCODE -ne 0) { throw 'PostgreSQL integration tests failed.' }
& uv run pip-audit --progress-spinner off
if ($LASTEXITCODE -ne 0) { throw 'Python dependency audit failed.' }
Set-Location -LiteralPath "$projectRoot\apps\web"
& npm run typecheck
if ($LASTEXITCODE -ne 0) { throw 'TypeScript check failed.' }
& npx prettier --check app tests next.config.ts playwright.config.ts package.json tsconfig.json
if ($LASTEXITCODE -ne 0) { throw 'Web format check failed.' }
& npm audit
if ($LASTEXITCODE -ne 0) { throw 'Web dependency audit failed.' }
# Build before starting the web server; E2E runs against that explicitly started build.
& npm run test:e2e
if ($LASTEXITCODE -ne 0) { throw 'Browser tests failed. Start the API and built web application first.' }
Write-Output 'Local Lumen checks passed.'
