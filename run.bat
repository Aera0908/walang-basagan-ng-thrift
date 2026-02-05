@echo off
REM Simple script: run `npm run dev` from this folder and keep the window open
cd /d "%~dp0"

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Dev Server
echo   Command: npm run dev
echo =============================================
echo.

REM Install dependencies the first time (when node_modules is missing)
if not exist "node_modules" (
  echo node_modules folder not found. Running npm install...
  echo.
  npm install
  echo.
)

npm run dev

echo.
echo (If you see an error above, take a screenshot and send it.)
echo Press any key to close this window.
pause >nul

goto :eof

