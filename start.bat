@echo off
echo Starting Live Polling System...
echo.
echo Starting Backend Server...
start /B cmd /c "cd backend && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Application...
start /B cmd /c "cd frontend && npm start"
echo.
echo Both servers are starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
