@echo off
echo Starting ART ZONE dev server...
cd /d "%~dp0"
set PATH=%PATH%;C:\Program Files\nodejs
npm run dev
pause
