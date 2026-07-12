@echo off
setlocal

cd /d "%~dp0"

set "APP_PORT=5187"

if not exist package.json (
  echo package.json not found. Run this script from the project root.
  exit /b 1
)

where pnpm >nul 2>nul
if errorlevel 1 (
  echo pnpm was not found on PATH.
  echo Install pnpm or enable it with: corepack enable
  exit /b 1
)

if not exist node_modules (
  echo Installing dependencies...
  pnpm install
  if errorlevel 1 exit /b 1
)

echo Starting local dev server...
echo Open http://localhost:%APP_PORT%
pnpm exec vite --host 127.0.0.1 --port %APP_PORT% --strictPort
