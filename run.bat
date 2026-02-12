@echo off
REM Runs both frontend and backend. Admin Dashboard needs both.
cd /d "%~dp0"

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Dev Server
echo   Frontend + Backend (Admin needs both)
echo =============================================
echo.

REM Check for Node.js
where node >nul 2>&1
if %errorlevel% neq 0 (
  echo [ERROR] Node.js is not installed.
  echo.
  echo Please run install-node.bat first to install Node.js,
  echo then run this file again.
  echo.
  pause
  goto :eof
)

REM Install dependencies the first time (when node_modules is missing)
if not exist "node_modules" (
  echo Installing packages...
  echo.
  call npm install
  if %errorlevel% neq 0 (
    echo.
    echo [ERROR] npm install failed.
    pause
    goto :eof
  )
  echo.
)

echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3002
echo.
call npm run dev:all

echo.
echo (If you see an error above, take a screenshot and send it.)
echo Press any key to close this window.
pause >nul

goto :eof

