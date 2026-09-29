@echo off
title SIH26017 Land Acquisition Delay Predictive System Launcher
echo =====================================================================
echo  Starting SIH26017: Land Acquisition Delay Early Detection System
echo  Ministry of Rural Development (MoRD) - Government of India
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Scheduling browser launch once backend initializes (3s)...
start "" /b powershell -WindowStyle Hidden -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:8000/app'"

echo [2/2] Starting FastAPI backend server on http://localhost:8000 ...
echo System will automatically open in your default browser in 3 seconds.
echo Press Ctrl+C anytime in this window to stop the server.
echo.

.\.venv\Scripts\python.exe -m uvicorn src.api.app:app --host 127.0.0.1 --port 8000
pause
