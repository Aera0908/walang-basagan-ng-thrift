@echo off
REM Simple script: run `npm run dev` from this folder and keep the window open
cd /d "%~dp0"

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Dev Server
echo   Command: npm run dev
echo =============================================
echo.

npm run dev

echo.
echo (If you see an error above, take a screenshot and send it.)
echo Press any key to close this window.
pause >nul

goto :eof

