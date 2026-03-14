@echo off
setlocal

cd /d "%~dp0"

where npm.cmd >nul 2>nul
if errorlevel 1 (
  echo Node.js / npm non trovato. Installa Node.js e riprova.
  pause
  exit /b 1
)

if not exist node_modules (
  echo Installazione dipendenze...
  call npm.cmd install
  if errorlevel 1 (
    echo Installazione fallita.
    pause
    exit /b 1
  )
)

echo Avvio Landing Master Generator in locale...
echo URL: http://127.0.0.1:4173
if not exist .env (
  echo.
  echo Attenzione: manca il file .env. La preview funziona, ma la generazione AI richiede OPENAI_API_KEY.
  echo Crea .env partendo da .env.example prima di usare il bottone AI.
  echo.
)

start "" powershell.exe -NoProfile -WindowStyle Hidden -Command "Start-Sleep -Seconds 2; Start-Process 'http://127.0.0.1:4173'"

call npm.cmd run dev

if errorlevel 1 (
  echo.
  echo Il server si e chiuso con un errore.
  pause
  exit /b 1
)
