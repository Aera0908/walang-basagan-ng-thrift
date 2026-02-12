@echo off
setlocal

echo.
echo =============================================
echo   Walang Basagan ng Thrift - Node.js Install
echo =============================================
echo.

REM Check that the installer exists next to this script
if not exist "%~dp0node-installer.msi" (
  echo [ERROR] Could not find node-installer.msi in:
  echo         %~dp0
  echo.
  echo Make sure node-installer.msi is copied to this folder,
  echo then run this file again.
  echo.
  pause
  goto :eof
)

REM Basic check if node is already installed
where node >nul 2>&1
if %errorlevel%==0 (
  echo Node.js is already installed.
  echo.
  choice /M "Do you still want to run the installer" /C YN
  if errorlevel 2 goto :eof
)

echo Running Node.js installer...
echo You may see a security prompt - choose "Run" or "Yes".
echo.

REM Launch the MSI installer (normal UI so client can follow wizard)
start "" msiexec /i "%~dp0node-installer.msi"

echo.
echo The Node.js installer has been started.
echo Please follow the steps in the setup window.
echo.
echo When finished:
echo   1. Close this window.
echo   2. Double-click run.bat to start the site.
echo.
pause

endlocal
goto :eof

