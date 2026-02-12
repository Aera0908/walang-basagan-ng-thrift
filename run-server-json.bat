@echo off
REM Run backend with JSON store (no SQLite). Use if SQLite fails on Windows.
cd /d "%~dp0"
set USE_JSON_DB=1

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Backend (JSON)
echo   Port 3002 - No SQLite required
echo   Run: npm run seed:admin:json (first time)
echo =============================================
echo.

where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed. Run install-node.bat first.
  pause
  goto :eof
)

if not exist "node_modules" (
  echo Installing packages...
  call npm install
  echo.
)

call npm run dev:server

echo.
echo Server stopped. Press any key to close.
pause >nul
