@echo off
REM Add Vite dev server to Windows Firewall
REM Run as Administrator

echo.
echo [*] Adding Vite Dev Server (port 5173) to Windows Firewall...
echo.

powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList 'New-NetFirewallRule -DisplayName \"Vite Dev Server\" -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5173 -ErrorAction SilentlyContinue; Write-Host \"[✓] Firewall rule added! You can now access the app from mobile.\"; pause'"

echo.
echo Done!
pause
