# 📚 NotAr - Sistema de Notas Educativas con IA

Sistema completo de gestión de notas educativas con integración de Inteligencia Artificial para generación y resumen automático de contenido.

## 🏗️ Arquitectura del Proyecto

Este proyecto está compuesto por dos servicios principales:

1. **Backend API (Node.js/Express)** - `back_notar_api/`
   - API REST principal
   - Autenticación y autorización
   - Gestión de usuarios y notas
   - Comunicación con el servicio de IA

2. **Servicio de IA (Python/FastAPI)** - `ia_service/`
   - Microservicio especializado en IA
   - Integración con Perplexity AI
   - Generación y resumen de notas

## 📋 Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Base de Datos](#base-de-datos)
- [Endpoints](#endpoints)
- [Ejecución](#ejecución)
- [Dependencias](#dependencias)
- [Estructura del Proyecto](#estructura-del-proyecto)

## 🔧 Requisitos

### Para el Backend API (Node.js)
- Node.js >= 14.x
- npm >= 6.x
- PostgreSQL (Supabase recomendado)

### Para el Servicio de IA (Python)
- Python >= 3.8
- pip

## 📦 Instalación

### 1. Backend API (Node.js)

```bash
cd back_notar_api
npm install
```

### 2. Servicio de IA (Python)

```bash
cd ia_service
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

## ⚙️ Configuración

### Variables de Entorno

#### Backend API (`back_notar_api/.env`)

Crea un archivo `.env` en la carpeta `back_notar_api/` con las siguientes variables:

```env
# Servidor
PORT=3000

# Base de Datos (Supabase)
DB_HOST=tu-host-de-supabase.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu-password
DB_NAME=postgres

# JWT
JWT_SECRET=tu-secret-key-super-segura-aqui

# Servicio de IA
IA_SERVICE_URL=http://localhost:8000
```

#### Servicio de IA (`ia_service/.env`)

Crea un archivo `.env` en la carpeta `ia_service/` con:

```env
# Perplexity API
OPENAI_API_KEY=tu-api-key-de-perplexity
```

## 🗄️ Base de Datos

El proyecto utiliza **PostgreSQL** (recomendado: Supabase). Las tablas principales son:

### Tablas Principales

1. **usuario**
   - `id_usuario` (PK)
   - `email` (unique)
   - `nombre`
   - `password_hash`
   - `rol` (default: 'estudiante')
   - `estado` (default: 'activo')
   - `racha_actual` (default: 0)
   - `ultimo_login`
   - `created_at`

2. **nota**
   - `id_nota` (PK)
   - `titulo`
   - `contenido`
   - `tipo_fuente`
   - `id_tema` (FK)
   - `id_usuario` (FK)
   - `id_documento` (nullable)
   - `estado` (default: 'publicado')
   - `fecha_creacion`

3. **tema**
   - `id_tema` (PK)
   - `nombre`
   - `num_busquedas`
   - `num_notas`

4. **racha** (modelo lógico, datos en tabla `usuario`)

### Características de la BD

- ✅ **Inmutabilidad**: Las notas no pueden editarse ni eliminarse una vez creadas
- ✅ **Sistema de rachas**: Tracking automático de días consecutivos creando notas
- ✅ **Auditoría**: Registro de acciones mediante middleware de auditoría

## 🔌 Endpoints

### Autenticación (`/api/auth`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Registrar nuevo usuario | No |
| POST | `/api/auth/login` | Iniciar sesión | No |

**Request Register:**
```json
{
  "email": "usuario@ejemplo.com",
  "nombre": "Juan Pérez",
  "password": "contraseña123"
}
```

**Request Login:**
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

**Response (Login/Register):**
```json
{
  "message": "Login exitoso",
  "user": {
    "id": 1,
    "email": "usuario@ejemplo.com",
    "nombre": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Notas (`/api/notas`)

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/notas` | Crear nueva nota | ✅ Sí |
| GET | `/api/notas/:id` | Obtener nota por ID | ✅ Sí |
| GET | `/api/notas/user/me` | Obtener mis notas | ✅ Sí |
| GET | `/api/notas/mas-buscadas` | Notas más buscadas | ✅ Sí |

**Request Crear Nota:**
```json
{
  "titulo": "Introducción a JavaScript",
  "contenido": "JavaScript es un lenguaje de programación...",
  "tipo_fuente": "manual",
  "id_tema": 1,
  "id_documento": null
}
```

**Query Params (GET notas):**
- `limit`: número de resultados (default: 50)
- `offset`: número de resultados a saltar (default: 0)

### IA (`/api/ia`)

| Método | Endpoint | Descripción | Auth | Rate Limit |
|--------|----------|-------------|------|------------|
| POST | `/api/ia/generate` | Generar nota con IA | ✅ Sí | 5/min |
| POST | `/api/ia/summarize` | Resumir texto | ✅ Sí | 5/min |

**Request Generate:**
```json
{
  "tema": "React Hooks",
  "contenido": "Información sobre React Hooks..."
}
```

**Request Summarize:**
```json
{
  "texto": "Texto largo a resumir..."
}
```

### Health Check

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Verificar estado del servidor |

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Servicio de IA (FastAPI)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/` | Información del servicio |
| GET | `/health` | Health check |
| POST | `/api/v1/generate` | Generar nota (interno) |
| POST | `/api/v1/summarize` | Resumir texto (interno) |

## 🚀 Ejecución

### Desarrollo

#### 1. Iniciar el Servicio de IA

```bash
cd ia_service
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

uvicorn app.main:app --reload --port 8000
```

El servicio estará disponible en: `http://localhost:8000`

#### 2. Iniciar el Backend API

```bash
cd back_notar_api
npm run dev  # Con nodemon para desarrollo
# o
npm start    # Sin nodemon
```

El API estará disponible en: `http://localhost:3000`

### Producción

#### Backend API

```bash
cd back_notar_api
npm start
```

#### Servicio de IA

```bash
cd ia_service
venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## 📚 Dependencias

### Backend API (`back_notar_api/package.json`)

- **express**: ^5.1.0 - Framework web
- **pg**: ^8.16.3 - Cliente PostgreSQL
- **jsonwebtoken**: ^9.0.2 - Autenticación JWT
- **bcryptjs**: ^3.0.3 - Hash de contraseñas
- **axios**: ^1.13.1 - Cliente HTTP para llamadas al servicio de IA
- **cors**: ^2.8.5 - Manejo de CORS
- **helmet**: ^8.1.0 - Seguridad HTTP
- **morgan**: ^1.10.1 - Logging de requests
- **express-rate-limit**: ^8.2.1 - Rate limiting
- **express-validator**: ^7.3.0 - Validación de datos
- **dotenv**: ^17.2.3 - Variables de entorno

### Servicio de IA (`ia_service/requirements.txt`)

- **fastapi**: ^0.121.0 - Framework web asíncrono
- **uvicorn**: ^0.38.0 - Servidor ASGI
- **openai**: ^2.6.1 - Cliente OpenAI/Perplexity
- **pydantic**: ^2.12.3 - Validación de datos
- **python-dotenv**: ^1.2.1 - Variables de entorno
- **httpx**: ^0.28.1 - Cliente HTTP asíncrono

## 📁 Estructura del Proyecto

```
back_notar/
│
├── back_notar_api/              # API Principal (Node.js)
│   ├── src/
│   │   ├── app.js              # Configuración de Express
│   │   ├── server.js           # Punto de entrada
│   │   ├── config/
│   │   │   └── database.js     # Configuración de BD
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── iaController.js
│   │   │   └── notaController.js
│   │   ├── middlewares/
│   │   │   ├── auth.js         # JWT authentication
│   │   │   ├── audit.js        # Auditoría
│   │   │   ├── rateLimiter.js  # Rate limiting
│   │   │   └── validator.js    # Validación de requests
│   │   ├── models/
│   │   │   ├── Usuario.js
│   │   │   ├── Nota.js
│   │   │   └── Racha.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── ia.routes.js
│   │   │   └── nota.routes.js
│   │   └── services/
│   │       ├── iaClient.js
│   │       └── rachaService.js
│   ├── package.json
│   └── .env                     # Variables de entorno
│
└── ia_service/                  # Servicio de IA (Python)
    ├── app/
    │   ├── main.py             # Configuración FastAPI
    │   ├── routes/
    │   │   └── generation.py   # Endpoints de IA
    │   └── services/
    │       └── perplexity_service.py  # Lógica de Perplexity
    ├── requirements.txt
    ├── venv/                    # Entorno virtual
    └── .env                     # Variables de entorno
```

## 🔐 Seguridad

- ✅ **JWT Authentication**: Tokens con expiración de 7 días
- ✅ **Password Hashing**: bcryptjs con salt rounds = 10
- ✅ **Rate Limiting**: 5 peticiones/minuto para endpoints de IA
- ✅ **Helmet**: Headers de seguridad HTTP
- ✅ **CORS**: Configurado para permitir orígenes específicos
- ✅ **Input Validation**: express-validator para validar datos de entrada
- ✅ **SQL Injection Protection**: Consultas parametrizadas con pg

## 📝 Características Principales

1. **Sistema de Autenticación**
   - Registro e inicio de sesión
   - Tokens JWT con expiración
   - Middleware de autenticación en rutas protegidas

2. **Gestión de Notas**
   - Creación de notas (inmutables)
   - Consulta de notas propias
   - Búsqueda de notas más populares
   - Sistema de temas/categorías

3. **Integración con IA**
   - Generación automática de notas con Perplexity AI
   - Resumen automático de texto
   - Rate limiting para control de uso

4. **Sistema de Rachas**
   - Tracking automático de días consecutivos
   - Incremento automático al crear notas
   - Motivación para uso consistente

5. **Auditoría**
   - Registro de acciones importantes
   - Middleware de auditoría configurable

## 🧪 Testing

### Probar Endpoints

#### 1. Health Check
```bash
curl http://localhost:3000/health
```

#### 2. Registrar Usuario
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","nombre":"Test User","password":"test123"}'
```

#### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123"}'
```

#### 4. Crear Nota (con token)
```bash
curl -X POST http://localhost:3000/api/notas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -d '{"titulo":"Mi Nota","contenido":"Contenido...","tipo_fuente":"manual","id_tema":1}'
```

## 🐛 Troubleshooting

### Error de conexión a la base de datos
- Verifica las variables de entorno en `.env`
- Asegúrate de que Supabase esté accesible
- Verifica las credenciales de conexión

### Error al conectar con el servicio de IA
- Verifica que el servicio de IA esté corriendo en `http://localhost:8000`
- Revisa los logs del servicio de IA

### Error de autenticación
- Verifica que `JWT_SECRET` esté configurado
- Asegúrate de incluir el header `Authorization: Bearer TOKEN`

### Error con Perplexity API
- Verifica que `OPENAI_API_KEY` esté configurado correctamente
- Asegúrate de tener créditos disponibles en Perplexity

## 📄 Licencia

ISC

## 👥 Autor

Proyecto desarrollado para gestión de notas educativas con IA.

---

**Nota**: Asegúrate de no commitear los archivos `.env` con información sensible. Utiliza `.gitignore` para excluirlos del repositorio.

