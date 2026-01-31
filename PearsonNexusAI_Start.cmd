@echo off
setlocal

REM One-click launcher for PearsonNexusAI (UI + local backend).
REM Opens the stable /launch page and starts the dev servers.

set "APP_DIR=%~dp0project"
if not exist "%APP_DIR%\\package.json" (
  echo Could not find "%APP_DIR%\\package.json"
  echo If you moved folders, update this script.
  pause
  exit /b 1
)

cd /d "%APP_DIR%"

REM Ensure server auth mode
set "VITE_AUTH_BACKEND=server"

REM Install deps once (fast no-op if already installed)
if not exist "node_modules\\" (
  echo Installing dependencies...
  npm install
)

echo.
echo Phone bookmark (best): http://%COMPUTERNAME%:3001/launch
echo Local:               http://localhost:3001/launch
echo.
start "" "http://localhost:3001/launch"

npm run dev

