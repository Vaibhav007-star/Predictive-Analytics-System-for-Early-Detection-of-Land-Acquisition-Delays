@echo off
title SIH26017 Automated Test Suite Runner
echo =====================================================================
echo  Running SIH26017 Automated Pytest Verification Suite (30 Tests)
echo =====================================================================
echo.

cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_EXE=.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

"%PYTHON_EXE%" -m pytest tests/ -v

echo.
echo =====================================================================
echo  Tests Completed!
echo =====================================================================
pause
