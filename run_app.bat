@echo off
title SIH26017 Land Acquisition Delay Predictive System Launcher
echo =====================================================================
echo  Starting SIH26017: Land Acquisition Delay Early Detection System
echo  Ministry of Rural Development (MoRD) - Government of India
echo =====================================================================
echo.

cd /d "%~dp0"

echo [1/2] Launching web browser to http://localhost:8000/app ...
start "" "http://localhost:8000/app"

echo [2/2] Starting FastAPI backend server on port 8000 ...
echo Press Ctrl+C anytime to stop the server.
echo.

.\.venv\Scripts\python.exe -m uvicorn src.api.app:app --host 0.0.0.0 --port 8000 --reload
pause
