: << 'CMDBLOCK'
@echo off
REM Windows launcher for SessionStart bootstrap hooks.

set "HOOK_DIR=%~dp0"

where powershell.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%HOOK_DIR%session-start.ps1"
    exit /b %ERRORLEVEL%
)

exit /b 0
CMDBLOCK

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "${SCRIPT_DIR}/session-start"
