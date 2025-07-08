@echo off
echo 🚀 Iniciando build para Railway...

echo 📦 Instalando dependencias...
npm install

echo 🧹 Limpiando build anterior...
if exist build rmdir /s /q build

echo 🔨 Ejecutando build...
npm run build

if not exist build (
    echo ❌ Error: El directorio build no se creó
    exit /b 1
)

echo 📋 Copiando archivos de configuración...
if exist public\_headers copy public\_headers build\_headers >nul 2>&1
if exist public\_redirects copy public\_redirects build\_redirects >nul 2>&1
if exist public\.htaccess copy public\.htaccess build\.htaccess >nul 2>&1

echo 🔍 Verificando archivos críticos...
if exist build\sw.js (
    echo ✅ Service Worker encontrado
) else (
    echo ❌ Service Worker no encontrado
)

if exist build\manifest.json (
    echo ✅ Manifest encontrado
) else (
    echo ❌ Manifest no encontrado
)

if exist build\index.html (
    echo ✅ Index.html encontrado
) else (
    echo ❌ Index.html no encontrado
)

echo ✅ Build completado exitosamente!
echo 📁 Archivos listos en el directorio build/ 