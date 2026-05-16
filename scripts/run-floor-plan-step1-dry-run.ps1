# Exécute le dry-run SQL contre la base Supabase (lecture seule).
# Usage :
#   .\scripts\run-floor-plan-step1-dry-run.ps1 -DatabaseUrl "postgresql://..."
#   $env:DATABASE_URL = "..." ; .\scripts\run-floor-plan-step1-dry-run.ps1
#
# Connection string : Supabase → Project Settings → Database → Connection string (URI)

param(
  [string]$DatabaseUrl = $env:DATABASE_URL
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$sqlFile = Join-Path $root "supabase\scripts\floor_plan_step1_dry_run.sql"

if (-not $DatabaseUrl) {
  Write-Host "DATABASE_URL manquant." -ForegroundColor Yellow
  Write-Host "Option A : passer -DatabaseUrl"
  Write-Host "Option B : coller supabase/scripts/floor_plan_step1_dry_run.sql dans Supabase SQL Editor"
  exit 1
}

Push-Location $root
try {
  npx --yes supabase@2 db query --db-url $DatabaseUrl --agent=no -o table -f $sqlFile
} finally {
  Pop-Location
}
