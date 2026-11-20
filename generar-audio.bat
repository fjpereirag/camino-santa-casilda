@echo off
chcp 65001 >nul
title Generar audio - El camino de las rosas
cd /d "%~dp0"
echo.
echo  Generar audio - El camino de las rosas
echo  Voz de mujer (Microsoft Edge, gratuita). Necesita internet.
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo  No encuentro Python. Instalalo desde https://www.python.org y vuelve a abrir este archivo.
  pause
  exit /b 1
)
python -m pip install --quiet --upgrade edge-tts
python audio\generar_audio.py %*
echo.
pause
