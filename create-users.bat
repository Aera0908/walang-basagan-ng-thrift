@echo off
setlocal
REM Creates user accounts: 1 admin, 3 mod, 5 buyer
REM Portable: use script directory so it works when copied to any location
cd /d "%~dp0"

echo.
echo =============================================
echo   Create Users (1 admin, 3 mod, 5 buyer)
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

echo --- JSON store (for run-server-json.bat) ---
node server/seed-users-json.js
echo.

echo --- SQLite (for run.bat) ---
node server/seed-users.js 2>nul
if %errorlevel% neq 0 (
  echo SQLite not available - use run-server-json.bat and the JSON users above.
) else (
  echo SQLite users created.
)

echo.
echo =============================================
echo   Default credentials:
echo   Admin: admin@wbnt.com / admin / admin123
echo   Mod:   mod1@wbnt.com / mod1 / mod123
echo   User:  user1@wbnt.com / user1 / user123
echo =============================================
echo.
pause

endlocal
goto :eof
