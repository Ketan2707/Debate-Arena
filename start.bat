@echo off
title ArguForge AI Launcher

echo ==========================================
echo        ArguForge AI - Starting App
echo ==========================================
echo.

:: Start the backend in a new terminal window
echo [1/2] Starting Backend (FastAPI)...
start "ArguForge AI Backend" cmd /k "cd /d %~dp0 && call venv\Scripts\activate && uvicorn backend.main:app --reload --port 8080"

:: Give the backend a moment to start
timeout /t 3 /nobreak >nul

:: Start the frontend in a new terminal window
echo [2/2] Starting Frontend (Vite)...
start "ArguForge AI Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ==========================================
echo   Both servers are starting in separate
echo   terminal windows.
echo.
echo   Backend:  http://localhost:8080
echo   Frontend: http://localhost:5173
echo ==========================================
echo.
echo You can close this window.
pause
