@echo off
title SIH26017 Automated Test Suite Runner
echo =====================================================================
echo  Running SIH26017 Automated Pytest Verification Suite (30 Tests)
echo =====================================================================
echo.

cd /d "%~dp0"
.\.venv\Scripts\python.exe -m pytest tests/ -v

echo.
echo =====================================================================
echo  Tests Completed!
echo =====================================================================
pause
