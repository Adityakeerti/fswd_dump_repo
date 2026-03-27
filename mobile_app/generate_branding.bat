@echo off
echo 🚀 Generating app icons and splash screens for Pustak Tracker...

REM Generate app icons
echo 📱 Generating app icons...
flutter pub run flutter_launcher_icons:main

REM Generate splash screens
echo 🎨 Generating splash screens...
flutter pub run flutter_native_splash:create

echo ✅ App branding assets generated successfully!
echo.
echo 📋 Next steps:
echo 1. Run 'flutter clean' to clear build cache
echo 2. Run 'flutter pub get' to refresh dependencies
echo 3. Run 'flutter run' to test the updated branding
echo.
echo 🎯 Branding features implemented:
echo - Rounded logo with shadow effects
echo - Consistent brand colors (Green primary, Blue secondary)
echo - Gradient backgrounds on key screens
echo - Branded app icons and splash screens
echo - Consistent typography and spacing
echo - Theme-aware color schemes

pause