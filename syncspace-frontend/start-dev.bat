@echo off
cd /d "%~dp0"
echo ========================================
echo   Starting Sync-Space Local Dev Server
echo ========================================
if not exist "node_modules" (
    echo Installing dependencies...
    call npm.cmd install
)
echo Starting server at http://localhost:3000/
start "" "http://localhost:3000/"
call npm.cmd run dev
pause
