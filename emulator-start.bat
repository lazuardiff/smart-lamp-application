@echo off
echo Starting Android Emulator...

rem Locate the emulator executable in your Android SDK
set EMULATOR_PATH=%LOCALAPPDATA%\Android\Sdk\emulator

rem List available emulators
echo Available emulators:
cd %EMULATOR_PATH%
emulator -list-avds

rem Start your preferred emulator (replace "Pixel_4_API_30" with your emulator name)
echo Starting emulator...
start emulator -avd Pixel_7_API_35
