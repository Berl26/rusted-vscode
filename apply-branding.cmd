@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js is not on PATH.
  pause
  exit /b 1
)
node "%~dp0brand-rusted-vscode.cjs"
set "code=%ERRORLEVEL%"
echo.
if not "%code%"=="0" echo ERROR: Branding was not applied.
if "%code%"=="0" echo Next: git diff -- product.json
pause
exit /b %code%
