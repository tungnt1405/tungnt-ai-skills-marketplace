: << 'CMDBLOCK'
@echo off
REM Cross-platform polyglot entrypoint for SessionStart hooks.

set "HOOK_DIR=%~dp0"

if exist "C:\Program Files\Git\bin\bash.exe" (
    "C:\Program Files\Git\bin\bash.exe" -l -c "cd \"$(cygpath -u \"%HOOK_DIR%\")\" && \"./session-start\""
    exit /b %ERRORLEVEL%
)
if exist "C:\Program Files (x86)\Git\bin\bash.exe" (
    "C:\Program Files (x86)\Git\bin\bash.exe" -l -c "cd \"$(cygpath -u \"%HOOK_DIR%\")\" && \"./session-start\""
    exit /b %ERRORLEVEL%
)

where bash >nul 2>nul
if %ERRORLEVEL% equ 0 (
    bash -l -c "cd \"$(cygpath -u \"%HOOK_DIR%\")\" && \"./session-start\""
    exit /b %ERRORLEVEL%
)

exit /b 0
CMDBLOCK

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
exec bash "${SCRIPT_DIR}/session-start"
