# Guardian Eye SIEM - Despliegue Automático

Este proyecto incluye scripts para desplegar Guardian Eye SIEM en Ubuntu 22.04 con un sistema de inicio automático.

## Scripts Disponibles

- `start.sh`: Inicia la aplicación directamente
- `deploy.sh`: Despliega la aplicación como un servicio del sistema

## Despliegue Rápido

Para un despliegue rápido "drop and run":

1. Extrae el paquete en tu servidor Ubuntu 22.04
2. Ejecuta el script de despliegue:
   ```bash
   ./deploy.sh
   ```

## Inicio Manual

Para iniciar la aplicación manualmente:
```bash
./start.sh
```

## Acceso a la Aplicación

Una vez iniciada, la aplicación estará disponible en:
http://localhost:8080

## Gestión del Servicio (después del despliegue)

- Ver estado: `sudo systemctl status guardian-eye-siem`
- Iniciar servicio: `sudo systemctl start guardian-eye-siem`
- Detener servicio: `sudo systemctl stop guardian-eye-siem`
- Reiniciar servicio: `sudo systemctl restart guardian-eye-siem`
