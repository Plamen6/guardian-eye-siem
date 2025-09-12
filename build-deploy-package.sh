#!/bin/bash

# Script para construir el paquete de despliegue para Ubuntu 22.04
echo "Construyendo paquete de despliegue para Ubuntu 22.04..."

# Crear directorio temporal para el paquete
DEPLOY_DIR="guardian-eye-siem-deploy"
rm -rf $DEPLOY_DIR
mkdir $DEPLOY_DIR

# Copiar archivos del proyecto
cp -r dist $DEPLOY_DIR/
cp -r supabase $DEPLOY_DIR/
cp package.json $DEPLOY_DIR/
cp vite.config.ts $DEPLOY_DIR/
cp README.md $DEPLOY_DIR/ 2>/dev/null || echo "No se encontró README.md"

# Crear script de instalación
cat > $DEPLOY_DIR/install.sh << 'EOF'
#!/bin/bash

# Script de instalación para Guardian Eye SIEM
echo "Instalando Guardian Eye SIEM..."

# Verificar si estamos en Ubuntu 22.04
if ! grep -q "Ubuntu 22.04" /etc/os-release; then
  echo "Advertencia: Este script está diseñado para Ubuntu 22.04"
  read -p "¿Deseas continuar? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
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
npm install --production

# Configurar servicio del sistema
sudo tee /etc/systemd/system/guardian-eye-siem.service > /dev/null << 'SYSTEMD_EOF'
[Unit]
Description=Guardian Eye SIEM
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/guardian-eye-siem
ExecStart=/usr/bin/npm run preview
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SYSTEMD_EOF

echo "Servicio configurado en /etc/systemd/system/guardian-eye-siem.service"

# Crear directorio de instalación
sudo mkdir -p /opt/guardian-eye-siem
sudo chown $USER:$USER /opt/guardian-eye-siem

echo "Instalación completada!"
echo "Para iniciar la aplicación:"
echo "1. Copia los archivos a /opt/guardian-eye-siem"
echo "2. Ejecuta: sudo systemctl daemon-reload"
echo "3. Ejecuta: sudo systemctl enable guardian-eye-siem"
echo "4. Ejecuta: sudo systemctl start guardian-eye-siem"
echo "La aplicación estará disponible en http://localhost:8080"
EOF

chmod +x $DEPLOY_DIR/install.sh

# Crear script de despliegue
cat > $DEPLOY_DIR/deploy.sh << 'EOF'
#!/bin/bash

# Script para desplegar Guardian Eye SIEM
echo "Desplegando Guardian Eye SIEM..."

# Detener servicio si está corriendo
sudo systemctl stop guardian-eye-siem 2>/dev/null || true

# Copiar archivos al directorio de instalación
sudo rsync -av --delete ./ /opt/guardian-eye-siem/

# Establecer permisos
sudo chown -R $USER:$USER /opt/guardian-eye-siem
sudo chmod +x /opt/guardian-eye-siem/install.sh

# Recargar systemd
sudo systemctl daemon-reload

# Iniciar servicio
sudo systemctl start guardian-eye-siem

echo "Despliegue completado!"
echo "La aplicación está disponible en http://localhost:8080"
echo "Para ver el estado del servicio: sudo systemctl status guardian-eye-siem"
EOF

chmod +x $DEPLOY_DIR/deploy.sh

# Crear archivo de instrucciones
cat > $DEPLOY_DIR/README_DEPLOY.md << 'EOF'
# Guardian Eye SIEM - Paquete de Despliegue

Este paquete contiene todos los archivos necesarios para desplegar Guardian Eye SIEM en Ubuntu 22.04.

## Requisitos Previos

- Ubuntu 22.04 LTS
- Acceso root o sudo

## Instrucciones de Despliegue

### Método 1: Despliegue Automático (Recomendado)

1. Extrae este paquete en el servidor destino
2. Ejecuta el script de instalación:
   ```bash
   ./install.sh
   ```
3. Ejecuta el script de despliegue:
   ```bash
   ./deploy.sh
   ```

### Método 2: Despliegue Manual

1. Copia los archivos al directorio de instalación:
   ```bash
   sudo mkdir -p /opt/guardian-eye-siem
   sudo rsync -av --delete ./ /opt/guardian-eye-siem/
   ```

2. Configura el servicio del sistema:
   ```bash
   sudo cp /opt/guardian-eye-siem/guardian-eye-siem.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable guardian-eye-siem
   ```

3. Inicia el servicio:
   ```bash
   sudo systemctl start guardian-eye-siem
   ```

## Acceso a la Aplicación

Una vez desplegado, la aplicación estará disponible en:
http://localhost:8080

## Gestión del Servicio

- Ver estado: `sudo systemctl status guardian-eye-siem`
- Iniciar servicio: `sudo systemctl start guardian-eye-siem`
- Detener servicio: `sudo systemctl stop guardian-eye-siem`
- Reiniciar servicio: `sudo systemctl restart guardian-eye-siem`

## Configuración

Antes de iniciar la aplicación, asegúrate de configurar las variables de entorno necesarias en `/opt/guardian-eye-siem/.env`

EOF

# Comprimir paquete
tar -czf guardian-eye-siem-ubuntu-22.04.tar.gz $DEPLOY_DIR

echo "Paquete de despliegue creado: guardian-eye-siem-ubuntu-22.04.tar.gz"
echo "Contenido del paquete:"
ls -la $DEPLOY_DIR

# Limpiar
rm -rf $DEPLOY_DIR
