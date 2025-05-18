# WhatsApp Message Scheduler

Aplicación para programar mensajes de WhatsApp con autenticación de usuarios y base de datos PostgreSQL.

## 📦 Últimas Actualizaciones
- Configuración inicial de PostgreSQL completada
- GitHub Actions configurado para CI/CD
- Comando `npm run deploy` para subir cambios fácilmente
- Estructura completa de frontend (React) y backend (Node.js/Express)

## 🚀 Configuración Inicial

1. **Variables de Entorno**:
   - Configurar `.env` en `/server` con:
     ```
     DB_HOST=localhost
     DB_USER=postgres
     DB_PASSWORD=nopasaran
     DB_NAME=whatsapp
     DB_PORT=5432
     ```

2. **Base de Datos**:
   ```bash
   psql -U postgres -c "CREATE DATABASE whatsapp;"
   ```

## ⚙️ Instalación

### Backend
```bash
cd server
npm install
npm start
```

### Frontend
```bash
cd client
npm install
npm run build
```

## 🔄 Flujo de Trabajo

- Para subir cambios a GitHub:
  ```bash
  npm run deploy  # Con mensaje de commit
  npm run quick-deploy  # Sin mensaje
  ```

## 📝 Estructura del Proyecto

```
whatsapp-scheduler/
├── client/          # Frontend React
├── server/          # Backend Node.js
│   ├── routes/      # Endpoints API
│   └── .env         # Configuración
└── .github/workflows # GitHub Actions
```

## 📧 Próximos Pasos
- Configurar SMTP para verificación por email
- Implementar el envío real de mensajes programados
