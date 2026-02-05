@echo off
setlocal

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Dev Server
echo =============================================
echo.

REM Go to the folder where this script is located
cd /d "%~dp0"

REM Quick check for Node.js
where node >nul 2>&1
if not %errorlevel%==0 (
  echo [ERROR] Node.js is not installed or not in PATH.
  echo.
  echo 1) Run install-node.bat first to install Node.js
  echo 2) Then double-click run.bat again.
  echo.
  pause
  goto :eof
)

REM If node_modules is missing, run npm install once
if not exist "node_modules" (
  echo node_modules folder not found. Installing dependencies...
  echo This may take a few minutes the first time.
  echo.
  npm install
  if not %errorlevel%==0 (
    echo.
    echo [ERROR] npm install failed. Please check the messages above.
    echo.
    pause
    goto :eof
  )
)

echo.
echo Starting development server...
echo A browser window should open at http://localhost:5173/
echo (If it does not, you can open it manually.)
echo.

REM Start Vite dev server
npm run dev

echo.
echo Dev server stopped. You can close this window.
echo.
pause

endlocal
goto :eof

