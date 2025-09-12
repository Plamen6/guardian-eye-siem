#!/bin/bash

# Script para desplegar Guardian Eye SIEM en Ubuntu 22.04
echo "Desplegando Guardian Eye SIEM en Ubuntu 22.04..."

# Verificar si estamos en Ubuntu 22.04
if ! grep -q "Ubuntu 22.04" /etc/os-release 2>/dev/null; then
  echo "Advertencia: Este script está diseñado para Ubuntu 22.04"
  echo "Es posible que necesites ajustes para tu sistema operativo."
fi

# Actualizar sistema
echo "Actualizando sistema..."
sudo apt update

# Instalar Node.js si no está presente
if ! command -v node &> /dev/null; then
  echo "Instalando Node.js..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
  sudo apt-get install -y nodejs
else
  echo "Node.js ya está instalado"
fi

# Instalar dependencias del proyecto
echo "Instalando dependencias del proyecto..."
npm install

# Construir la aplicación
echo "Construyendo la aplicación..."
npm run build

# Crear directorio de instalación
sudo mkdir -p /opt/guardian-eye-siem
sudo chown $USER:$USER /opt/guardian-eye-siem

# Copiar archivos al directorio de instalación
echo "Copiando archivos al directorio de instalación..."
sudo rsync -av --delete ./ /opt/guardian-eye-siem/ --exclude node_modules
sudo chown -R $USER:$USER /opt/guardian-eye-siem

# Crear script de inicio en el directorio de instalación
sudo tee /opt/guardian-eye-siem/start.sh > /dev/null << 'EOF'
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
EOF

# Establecer permisos para el script de inicio
sudo chmod +x /opt/guardian-eye-siem/start.sh

# Instalar dependencias en el directorio de instalación
cd /opt/guardian-eye-siem
npm install --production

# Configurar el servicio del sistema para auto-inicio
echo "Configurando servicio del sistema..."
sudo tee /etc/systemd/system/guardian-eye-siem.service > /dev/null << 'EOF'
[Unit]
Description=Guardian Eye SIEM
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/guardian-eye-siem
ExecStart=/opt/guardian-eye-siem/start.sh
Restart=always
RestartSec=10
Environment=NODE_ENV=production
Environment=PATH=/usr/bin:/bin:/usr/local/bin

[Install]
WantedBy=multi-user.target
EOF

# Recargar systemd y habilitar el servicio
echo "Habilitando el servicio..."
sudo systemctl daemon-reload
sudo systemctl enable guardian-eye-siem

echo "Despliegue completado!"
echo "La aplicación está disponible en http://localhost:8080"
echo "Para ver el estado del servicio: sudo systemctl status guardian-eye-siem"
echo ""
echo "Para iniciar la aplicación manualmente, ejecuta:"
echo "  cd /opt/guardian-eye-siem && ./start.sh"
