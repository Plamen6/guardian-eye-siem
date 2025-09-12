# Guardian Eye SIEM - Instrucciones de Despliegue

Este documento proporciona instrucciones detalladas para desplegar Guardian Eye SIEM en un servidor Ubuntu 22.04.

## Requisitos Previos

- Servidor Ubuntu 22.04 LTS
- Acceso root o con privilegios sudo
- Conexión a internet para descargar dependencias

## Método 1: Despliegue Automático (Recomendado)

### 1. Ejecutar el Script de Despliegue

```bash
./deploy.sh
```

Este script realizará automáticamente las siguientes acciones:
- Verificará la versión del sistema operativo
- Instalará Node.js si no está presente
- Instalará las dependencias del proyecto
- Construirá la aplicación para producción
- Copiará los archivos al directorio de instalación `/opt/guardian-eye-siem`
- Configurará el servicio systemd para auto-inicio
- Habilitará el servicio para que se inicie automáticamente en el arranque

### 2. Verificar el Estado del Servicio

```bash
sudo systemctl status guardian-eye-siem
```

### 3. Acceder a la Aplicación

Una vez completado el despliegue, la aplicación estará disponible en:
```
http://<IP_DEL_SERVIDOR>:8080
```

## Método 2: Despliegue Manual

### 1. Instalar Dependencias del Sistema

```bash
# Actualizar sistema
sudo apt update

# Instalar Node.js (si no está instalado)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Construir la Aplicación

```bash
# Instalar dependencias del proyecto
npm install

# Construir la aplicación para producción
npm run build
```

### 3. Preparar Directorio de Instalación

```bash
# Crear directorio de instalación
sudo mkdir -p /opt/guardian-eye-siem
sudo chown $USER:$USER /opt/guardian-eye-siem

# Copiar archivos al directorio de instalación
rsync -av --delete ./ /opt/guardian-eye-siem/ --exclude node_modules
```

### 4. Configurar el Servicio del Sistema

Crear el archivo de servicio:
```bash
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
```

### 5. Configurar el Script de Inicio

Crear el script de inicio en `/opt/guardian-eye-siem/start.sh`:
```bash
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
```

Hacer ejecutable el script:
```bash
sudo chmod +x /opt/guardian-eye-siem/start.sh
```

### 6. Iniciar el Servicio

```bash
# Recargar configuración de systemd
sudo systemctl daemon-reload

# Habilitar el servicio para auto-inicio
sudo systemctl enable guardian-eye-siem

# Iniciar el servicio
sudo systemctl start guardian-eye-siem
```

## Gestión del Servicio

### Comandos de Gestión

- Ver estado del servicio: `sudo systemctl status guardian-eye-siem`
- Iniciar el servicio: `sudo systemctl start guardian-eye-siem`
- Detener el servicio: `sudo systemctl stop guardian-eye-siem`
- Reiniciar el servicio: `sudo systemctl restart guardian-eye-siem`

### Ver Registros del Servicio

```bash
# Ver registros recientes
sudo journalctl -u guardian-eye-siem

# Ver registros en tiempo real
sudo journalctl -u guardian-eye-siem -f
```

## Configuración de Supabase

Antes de usar la aplicación, asegúrate de configurar las variables de entorno de Supabase:

1. Crear archivo `.env` en `/opt/guardian-eye-siem/`:
```bash
echo "VITE_SUPABASE_URL=tu_url_de_supabase" > /opt/guardian-eye-siem/.env
echo "VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase" >> /opt/guardian-eye-siem/.env
```

2. Reiniciar el servicio:
```bash
sudo systemctl restart guardian-eye-siem
```

## Solución de Problemas

### Problemas Comunes

1. **Servicio no inicia (código de error 127)**
   - Verificar que Node.js está instalado: `node --version`
   - Verificar que el script de inicio tiene permisos de ejecución: `ls -l /opt/guardian-eye-siem/start.sh`
   - Verificar el contenido del script de inicio: `cat /opt/guardian-eye-siem/start.sh`

2. **Aplicación no accesible en el puerto 8080**
   - Verificar que el servicio está corriendo: `sudo systemctl status guardian-eye-siem`
   - Verificar que el puerto 8080 no está bloqueado por el firewall: `sudo ufw status`
   - Verificar que ninguna otra aplicación está usando el puerto 8080: `sudo netstat -tlnp | grep :8080`

3. **Errores de dependencias**
   - Reinstalar dependencias: `cd /opt/guardian-eye-siem && npm install --production`
   - Verificar permisos del directorio: `ls -la /opt/guardian-eye-siem`

### Reiniciar el Despliegue

Si necesitas reiniciar el proceso de despliegue:

```bash
# Detener y deshabilitar el servicio actual
sudo systemctl stop guardian-eye-siem
sudo systemctl disable guardian-eye-siem

# Eliminar archivos antiguos
sudo rm -rf /opt/guardian-eye-siem
sudo rm -f /etc/systemd/system/guardian-eye-siem.service

# Ejecutar el script de despliegue nuevamente
./deploy.sh
```

## Actualización del Sistema

Para actualizar la aplicación a una nueva versión:

1. Detener el servicio:
```bash
sudo systemctl stop guardian-eye-siem
```

2. Reemplazar archivos en `/opt/guardian-eye-siem` con la nueva versión

3. Reconstruir la aplicación:
```bash
cd /opt/guardian-eye-siem
npm run build
```

4. Reiniciar el servicio:
```bash
sudo systemctl start guardian-eye-siem
```
