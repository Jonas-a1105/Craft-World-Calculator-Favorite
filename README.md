---
title: Craft World Calculator
emoji: 🛠️
colorFrom: green
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Craft World Calculator & Companion

Companion app and calculator for Craft World game resources, featuring:
- **Real-time pricing** from Katana V3 / GeckoTerminal.
- **Enterprise Architecture**: Backend with Prisma ORM (SQLite en modo WAL), validación en tiempo de ejecución con Zod y 100% tipado estricto (cero `any`).
- **PKCE OAuth 2.0 Integration**: Autenticación segura con refresco proactivo de tokens contra la API de Craft World.
- **Visual preferences**: Soporte para tema claro y oscuro.
- **Notificaciones**: Avisos de escritorio cuando terminan los ciclos de producción.
- **Testing Suite**: 98 pruebas automatizadas (85 en frontend, 13 en backend).

---

## 🚀 Running Locally / Ejecución Local

### 1. Clonar e Instalar Dependencias
```bash
# Entrar a la carpeta del proyecto
cd Craft-Companion

# Instalar dependencias del workspace (cliente y servidor)
npm install
```

### 2. Variables de Entorno
Copia `Craft-Companion/.env.example` a `Craft-Companion/server/.env`:
```bash
cp Craft-Companion/.env.example Craft-Companion/server/.env
```

### 3. Iniciar Servidores de Desarrollo
```bash
npm run dev
```
- **Cliente**: `http://localhost:5173`
- **Servidor**: `http://localhost:5000`

---

## 🧪 Pruebas Automatizadas

```bash
# Correr tests del cliente (85 tests)
npm run test --workspace client

# Correr tests del servidor (13 tests)
npm run test --workspace server
```

---

## 🐳 Despliegue con Docker (Hugging Face Spaces / VPS)

El proyecto incluye un `Dockerfile` optimizado en dos fases (builder y runner) para compilación y despliegue continuo:
```bash
docker build -t craft-world-companion .
docker run -p 7860:7860 craft-world-companion
```

---

## 🔒 Arquitectura & Seguridad

- **OAuth 2.0 con PKCE (S256)**: Protección contra ataques de interceptación de código de autorización.
- **Helmet & CORS**: Cabeceras defensivas HTTP estándar en la industria.
- **Graceful Shutdown**: Cierre ordenado de conexiones HTTP y desconexión segura de Prisma al recibir `SIGINT` o `SIGTERM`.
- **Runtime Validation**: Todos los parámetros de entrada y queries son validados con esquemas estrictos de **Zod**.

---

## 📄 Licencia

MIT
