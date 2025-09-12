#!/bin/bash

# Script para iniciar Guardian Eye SIEM automáticamente
echo "Iniciando Guardian Eye SIEM..."

# Cambiar al directorio de la aplicación
cd /opt/guardian-eye-siem

# Verificar si el directorio dist existe
if [ ! -d "dist" ]; then
  echo "Construyendo la aplicación..."
  npm run build
fi

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
  echo "Error: Node.js no está instalado."
  echo "Por favor, instala Node.js antes de ejecutar este script."
  exit 1
fi

# Verificar si las dependencias están instaladas
if [ ! -d "node_modules" ]; then
  echo "Instalando dependencias..."
  npm install --production
fi

# Usar serve para servir la aplicación en producción
if ! command -v serve &> /dev/null; then
  echo "Instalando serve para servir la aplicación..."
  npm install -g serve
fi

echo "Iniciando la aplicación en el puerto 8080..."
serve -s dist -l 8080
