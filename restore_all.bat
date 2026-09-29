@echo off
title SIH26017 Restore Clean Working Code
echo =====================================================================
echo  Overwriting / Restoring All Files to Clean Working Commit State
echo =====================================================================
echo.

cd /d "%~dp0"
git restore .
git clean -fd

echo.
echo =====================================================================
echo  All files successfully restored to clean working state!
echo =====================================================================
pause
