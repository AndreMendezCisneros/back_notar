# 📋 Documentación Detallada de Endpoints - NotAr API

## 🔐 Autenticación

Todos los endpoints (excepto `/api/auth/*` y `/health`) requieren autenticación mediante JWT token en el header:
```
Authorization: Bearer <token>
```

---

## 🌐 Backend API (Node.js/Express) - Puerto 3000

### Base URL: `http://localhost:3000`

---

## 1. 🔑 Endpoints de Autenticación (`/api/auth`)

### 1.1. POST `/api/auth/register`
**Descripción**: Registra un nuevo usuario en el sistema.

**Autenticación**: No requerida

**Body (JSON)**:
```json
{
  "email": "string (email válido, requerido)",
  "nombre": "string (requerido)",
  "password": "string (mínimo 6 caracteres, requerido)",
  "rol": "string (opcional: 'estudiante' | 'admin' | 'superadmin', por defecto: 'estudiante')"
}
```

**Validaciones**:
- `email`: Debe ser un email válido
- `nombre`: No puede estar vacío
- `password`: Mínimo 6 caracteres
- `rol`: Solo permite 'estudiante', 'admin' o 'superadmin'
- Solo puede existir un superadmin en el sistema

**Respuesta Exitosa (201)**:
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id_usuario": "number",
    "email": "string",
    "nombre": "string",
    "rol": "string",
    "fecha_registro": "timestamp"
  },
  "token": "string (JWT token, expira en 7 días)"
}
```

**Errores**:
- `400`: Email ya registrado / Ya existe un superadmin / Error de validación
- `500`: Error al registrar usuario

---

### 1.2. POST `/api/auth/login`
**Descripción**: Inicia sesión y obtiene un token JWT.

**Autenticación**: No requerida

**Body (JSON)**:
```json
{
  "email": "string (email válido, requerido)",
  "password": "string (requerido)"
}
```

**Validaciones**:
- `email`: Debe ser un email válido
- `password`: No puede estar vacío

**Respuesta Exitosa (200)**:
```json
{
  "message": "Login exitoso",
  "user": {
    "id": "number",
    "email": "string",
    "nombre": "string"
  },
  "token": "string (JWT token, expira en 7 días)"
}
```

**Errores**:
- `401`: Credenciales inválidas
- `500`: Error al iniciar sesión

---

## 2. 📝 Endpoints de Notas (`/api/notas`)

**Autenticación**: Requerida (JWT)

---

### 2.1. POST `/api/notas`
**Descripción**: Crea una nueva nota manualmente.

**Autenticación**: Requerida

**Body (JSON)**:
```json
{
  "titulo": "string (requerido, no puede estar vacío)",
  "contenido": "string (requerido, no puede estar vacío)",
  "tipo_fuente": "string (opcional)",
  "id_tema": "number (opcional, entero positivo)",
  "id_documento": "number (opcional, entero positivo o null)",
  "id_prompt": "number (opcional, entero positivo o null)"
}
```

**Validaciones**:
- `titulo`: Obligatorio, no puede estar vacío después de trim
- `contenido`: Obligatorio, no puede estar vacío después de trim
- `tipo_fuente`: Opcional, debe ser string
- `id_tema`: Opcional, entero positivo
- `id_documento`: Opcional, entero positivo o null
- `id_prompt`: Opcional, entero positivo o null

**Respuesta Exitosa (201)**:
```json
{
  "message": "Nota creada exitosamente",
  "nota": {
    "id_nota": "number",
    "titulo": "string",
    "contenido": "string",
    "tipo_fuente": "string",
    "id_tema": "number | null",
    "id_usuario": "number",
    "id_documento": "number | null",
    "id_prompt": "number | null",
    "fecha_creacion": "timestamp"
  },
  "racha_actual": {
    "id_racha": "number",
    "id_usuario": "number",
    "dias_consecutivos": "number",
    "ultima_fecha": "timestamp"
  }
}
```

**Errores**:
- `400`: Error de validación
- `401`: No autenticado
- `500`: Error al crear nota

**Auditoría**: Se registra la acción `nota_create` en la tabla de auditoría.

---

### 2.2. GET `/api/notas/user/me`
**Descripción**: Obtiene todas las notas del usuario autenticado.

**Autenticación**: Requerida

**Query Parameters**:
- `limit` (opcional): Número de resultados (por defecto: 50)
- `offset` (opcional): Número de resultados a saltar (por defecto: 0)

**Ejemplo**: `/api/notas/user/me?limit=20&offset=0`

**Respuesta Exitosa (200)**:
```json
{
  "notas": [
    {
      "id_nota": "number",
      "titulo": "string",
      "contenido": "string",
      "tipo_fuente": "string",
      "id_tema": "number | null",
      "id_usuario": "number",
      "id_documento": "number | null",
      "id_prompt": "number | null",
      "fecha_creacion": "timestamp"
    }
  ],
  "count": "number (cantidad de notas devueltas)",
  "limit": "number",
  "offset": "number"
}
```

**Errores**:
- `401`: No autenticado
- `500`: Error al obtener notas

---

### 2.3. GET `/api/notas/mas-buscadas`
**Descripción**: Obtiene las notas más populares/buscadas del sistema.

**Autenticación**: Requerida

**Query Parameters**:
- `limit` (opcional): Número de resultados (por defecto: 10)

**Ejemplo**: `/api/notas/mas-buscadas?limit=5`

**Respuesta Exitosa (200)**:
```json
{
  "notas_mas_buscadas": [
    {
      "id_nota": "number",
      "titulo": "string",
      "contenido": "string",
      "tipo_fuente": "string",
      "id_tema": "number | null",
      "id_usuario": "number",
      "id_documento": "number | null",
      "id_prompt": "number | null",
      "fecha_creacion": "timestamp",
      "veces_buscada": "number"
    }
  ]
}
```

**Errores**:
- `401`: No autenticado
- `500`: Error al obtener notas

---

### 2.4. GET `/api/notas/:id`
**Descripción**: Obtiene una nota específica por su ID.

**Autenticación**: Requerida

**Path Parameters**:
- `id`: ID de la nota (requerido)

**Ejemplo**: `/api/notas/123`

**Respuesta Exitosa (200)**:
```json
{
  "nota": {
    "id_nota": "number",
    "titulo": "string",
    "contenido": "string",
    "tipo_fuente": "string",
    "id_tema": "number | null",
    "id_usuario": "number",
    "id_documento": "number | null",
    "id_prompt": "number | null",
    "fecha_creacion": "timestamp"
  }
}
```

**Errores**:
- `401`: No autenticado
- `404`: Nota no encontrada
- `500`: Error al obtener nota

---

## 3. 📋 Endpoints de Cuestionarios (`/api/cuestionarios`)

**Autenticación**: Requerida (JWT)

**Nota**: Los cuestionarios se generan automáticamente cuando se crea una nota con IA. Estos endpoints permiten consultar los cuestionarios, preguntas y opciones asociados a las notas.

---

### 3.1. GET `/api/cuestionarios/nota/:id_nota`
**Descripción**: Obtiene todos los cuestionarios de una nota específica, incluyendo sus preguntas y opciones.

**Autenticación**: Requerida

**Path Parameters**:
- `id_nota`: ID de la nota (requerido)

**Ejemplo**: `/api/cuestionarios/nota/123`

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "id_nota": "number",
  "cuestionarios": [
    {
      "id_cuestionario": "number",
      "id_nota": "number",
      "titulo": "string",
      "descripcion": "string | null",
      "num_preguntas": "number | null",
      "fecha_creacion": "timestamp",
      "preguntas": [
        {
          "id_pregunta": "number",
          "id_cuestionario": "number",
          "contenido": "string",
          "tipo": "string",
          "nivel_dificultad": "string | null",
          "created_at": "timestamp | null",
          "opciones": [
            {
              "id_opcion": "number",
              "id_pregunta": "number",
              "contenido": "string",
              "es_correcta": "boolean"
            }
          ]
        }
      ]
    }
  ],
  "count": "number"
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permiso para acceder a esta nota
- `404`: Nota no encontrada
- `500`: Error al obtener cuestionarios

---

### 3.2. GET `/api/cuestionarios/:id`
**Descripción**: Obtiene un cuestionario completo por su ID, incluyendo todas sus preguntas y opciones.

**Autenticación**: Requerida

**Path Parameters**:
- `id`: ID del cuestionario (requerido)

**Ejemplo**: `/api/cuestionarios/45`

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "cuestionario": {
    "id_cuestionario": "number",
    "id_nota": "number",
    "titulo": "string",
    "descripcion": "string | null",
    "num_preguntas": "number | null",
    "fecha_creacion": "timestamp",
    "preguntas": [
      {
        "id_pregunta": "number",
        "id_cuestionario": "number",
        "contenido": "string",
        "tipo": "string",
        "nivel_dificultad": "string | null",
        "created_at": "timestamp | null",
        "opciones": [
          {
            "id_opcion": "number",
            "id_pregunta": "number",
            "contenido": "string",
            "es_correcta": "boolean"
          }
        ]
      }
    ]
  }
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permiso para acceder a este cuestionario
- `404`: Cuestionario no encontrado
- `500`: Error al obtener cuestionario

---

### 3.3. GET `/api/cuestionarios/:id_cuestionario/preguntas`
**Descripción**: Obtiene todas las preguntas de un cuestionario específico, incluyendo sus opciones.

**Autenticación**: Requerida

**Path Parameters**:
- `id_cuestionario`: ID del cuestionario (requerido)

**Ejemplo**: `/api/cuestionarios/45/preguntas`

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "id_cuestionario": "number",
  "preguntas": [
    {
      "id_pregunta": "number",
      "id_cuestionario": "number",
      "contenido": "string",
      "tipo": "string",
      "nivel_dificultad": "string | null",
      "created_at": "timestamp | null",
      "opciones": [
        {
          "id_opcion": "number",
          "id_pregunta": "number",
          "contenido": "string",
          "es_correcta": "boolean"
        }
      ]
    }
  ],
  "count": "number"
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permiso para acceder a este cuestionario
- `404`: Cuestionario no encontrado
- `500`: Error al obtener preguntas

---

### 3.4. GET `/api/cuestionarios/preguntas/:id`
**Descripción**: Obtiene una pregunta específica por su ID, incluyendo todas sus opciones.

**Autenticación**: Requerida

**Path Parameters**:
- `id`: ID de la pregunta (requerido)

**Ejemplo**: `/api/cuestionarios/preguntas/78`

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "pregunta": {
    "id_pregunta": "number",
    "id_cuestionario": "number",
    "contenido": "string",
    "tipo": "string",
    "nivel_dificultad": "string | null",
    "created_at": "timestamp | null",
    "opciones": [
      {
        "id_opcion": "number",
        "id_pregunta": "number",
        "contenido": "string",
        "es_correcta": "boolean"
      }
    ]
  }
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permiso para acceder a esta pregunta
- `404`: Pregunta no encontrada
- `500`: Error al obtener pregunta

---

## 4. 🤖 Endpoints de Inteligencia Artificial (`/api/ia`)

**Autenticación**: Requerida (JWT)
**Rate Limiting**: 5 peticiones por minuto (aplicado a todos los endpoints de IA)

---

### 3.1. POST `/api/ia/generate`
**Descripción**: Genera una nota educativa usando IA (Perplexity). Opcionalmente puede persistir la nota y sus cuestionarios en la base de datos.

**Autenticación**: Requerida

**Rate Limiting**: 5 peticiones/minuto

**Body (JSON)**:
```json
{
  "tema": "string (requerido)",
  "contenido": "string (opcional, por defecto: '')",
  "titulo": "string (opcional)",
  "id_tema": "number (opcional)",
  "persist": "boolean (opcional, por defecto: true)"
}
```

**Validaciones**:
- `tema`: Obligatorio
- `contenido`: Opcional, string vacío por defecto
- `titulo`: Opcional
- `id_tema`: Opcional, número entero
- `persist`: Opcional, si es `false` no guarda en BD, solo devuelve la respuesta de IA

**Proceso**:
1. Obtiene el prompt activo de la base de datos
2. Llama al servicio de IA (FastAPI) con el tema, contenido y prompt
3. Si `persist === true`:
   - Crea la nota en la base de datos
   - Crea el tema si no existe
   - Crea los cuestionarios, preguntas y opciones asociados
   - Actualiza la racha del usuario
   - Todo en una transacción

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "data": {
    "nota": {
      "titulo": "string",
      "contenido": "string",
      "tema": "string"
    },
    "cuestionarios": [
      {
        "titulo": "string",
        "descripcion": "string (opcional)",
        "preguntas": [
          {
            "tipo": "string (ej: 'seleccion_multiple')",
            "contenido": "string",
            "opciones": [
              {
                "contenido": "string",
                "es_correcta": "boolean"
              }
            ]
          }
        ]
      }
    ]
  },
  "persisted": "boolean",
  "nota_persistida": {
    "id_nota": "number",
    "titulo": "string",
    "contenido": "string",
    "tipo_fuente": "string (siempre 'ia')",
    "id_tema": "number | null",
    "id_usuario": "number",
    "id_prompt": "number",
    "fecha_creacion": "timestamp"
  } | null,
  "cuestionarios_persistidos": [
    {
      "id_cuestionario": "number",
      "titulo": "string",
      "contenido": "string | null",
      "id_nota": "number",
      "preguntas": [
        {
          "id_pregunta": "number",
          "tipo": "string",
          "contenido": "string",
          "id_cuestionario": "number",
          "opciones": [
            {
              "id_opcion": "number",
              "contenido": "string",
              "es_correcta": "boolean",
              "id_pregunta": "number"
            }
          ]
        }
      ]
    }
  ] | []
}
```

**Errores**:
- `400`: Tema es obligatorio
- `401`: No autenticado
- `429`: Demasiadas peticiones (rate limit)
- `500`: No hay prompt configurado / Error al generar nota / Error al guardar
- `502`: La IA no devolvió contenido utilizable

**Timeout**: 60 segundos para la llamada al servicio de IA

---

### 3.2. POST `/api/ia/summarize`
**Descripción**: Resume un texto usando IA (Perplexity).

**Autenticación**: Requerida

**Rate Limiting**: 5 peticiones/minuto

**Body (JSON)**:
```json
{
  "texto": "string (requerido)"
}
```

**Validaciones**:
- `texto`: Obligatorio

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "resumen": "string (resumen del texto)"
}
```

**Errores**:
- `400`: Texto es obligatorio
- `401`: No autenticado
- `429`: Demasiadas peticiones (rate limit)
- `500`: Error al resumir texto

**Timeout**: 30 segundos para la llamada al servicio de IA

---

## 5. 📋 Endpoints de Prompts (`/api/prompts`)

**Autenticación**: Requerida (JWT)

---

### 4.1. GET `/api/prompts/active`
**Descripción**: Obtiene el prompt activo actual del sistema.

**Autenticación**: Requerida (cualquier usuario autenticado)

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "data": {
    "id_version": "number",
    "numero_version": "string",
    "contenido_prompt": "string",
    "descripcion": "string | null",
    "fecha_creacion": "timestamp",
    "activo": "boolean"
  }
}
```

**Errores**:
- `401`: No autenticado
- `404`: No hay ningún prompt configurado
- `500`: Error de base de datos / Tabla no existe

---

### 4.2. GET `/api/prompts`
**Descripción**: Obtiene todos los prompts del sistema.

**Autenticación**: Requerida (solo superadmin)

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "data": [
    {
      "id_version": "number",
      "numero_version": "string",
      "contenido_prompt": "string",
      "descripcion": "string | null",
      "fecha_creacion": "timestamp",
      "activo": "boolean"
    }
  ],
  "count": "number"
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permisos (no eres superadmin)
- `500`: Error de base de datos

---

### 4.3. GET `/api/prompts/:id`
**Descripción**: Obtiene un prompt específico por su ID.

**Autenticación**: Requerida (solo superadmin)

**Path Parameters**:
- `id`: ID del prompt (requerido)

**Ejemplo**: `/api/prompts/1`

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "data": {
    "id_version": "number",
    "numero_version": "string",
    "contenido_prompt": "string",
    "descripcion": "string | null",
    "fecha_creacion": "timestamp",
    "activo": "boolean"
  }
}
```

**Errores**:
- `401`: No autenticado
- `403`: No tienes permisos (no eres superadmin)
- `404`: Prompt no encontrado
- `500`: Error de base de datos

---

### 4.4. POST `/api/prompts`
**Descripción**: Crea una nueva versión de prompt en el sistema.

**Autenticación**: Requerida (solo superadmin)

**Body (JSON)**:
```json
{
  "numero_version": "string (requerido, máximo 50 caracteres)",
  "contenido_prompt": "string (requerido, no puede estar vacío)",
  "descripcion": "string (opcional)"
}
```

**Validaciones**:
- `numero_version`: Obligatorio, máximo 50 caracteres
- `contenido_prompt`: Obligatorio, no puede estar vacío después de trim
- `descripcion`: Opcional, debe ser string

**Respuesta Exitosa (201)**:
```json
{
  "status": "success",
  "message": "Nueva versión de prompt creada exitosamente",
  "data": {
    "id_version": "number",
    "numero_version": "string",
    "contenido_prompt": "string",
    "descripcion": "string | null",
    "fecha_creacion": "timestamp",
    "activo": "boolean"
  }
}
```

**Errores**:
- `400`: Error de validación / numero_version y contenido_prompt son obligatorios
- `401`: No autenticado
- `403`: No tienes permisos (no eres superadmin)
- `500`: Error de base de datos / Error al crear prompt

---

## 6. 🏥 Endpoints de Health Check

### 5.1. GET `/health`
**Descripción**: Verifica el estado del servidor.

**Autenticación**: No requerida

**Respuesta Exitosa (200)**:
```json
{
  "status": "ok",
  "timestamp": "ISO 8601 timestamp"
}
```

---

## 🐍 Servicio de IA (Python/FastAPI) - Puerto 8000

### Base URL: `http://localhost:8000`

**Nota**: Estos endpoints son llamados internamente por el Backend API, no están diseñados para ser llamados directamente por el cliente.

---

## 7. 🤖 Endpoints del Servicio de IA (`/api/v1`)

---

### 7.1. POST `/api/v1/generate`
**Descripción**: Genera una nota estructurada con Perplexity AI.

**Autenticación**: No requerida (servicio interno)

**Body (JSON)**:
```json
{
  "tema": "string (requerido)",
  "contenido": "string (opcional, por defecto: '')",
  "prompt": "string (opcional, prompt personalizado)"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "data": {
    "nota": {
      "titulo": "string",
      "contenido": "string",
      "tema": "string"
    },
    "cuestionarios": [
      {
        "titulo": "string",
        "descripcion": "string (opcional)",
        "preguntas": [
          {
            "tipo": "string",
            "contenido": "string",
            "opciones": [
              {
                "contenido": "string",
                "es_correcta": "boolean"
              }
            ]
          }
        ]
      }
    ]
  }
}
```

**Errores**:
- `400`: Error en la petición
- `500`: Error al generar nota / API key no configurada

**Timeout**: 60 segundos

---

### 7.2. POST `/api/v1/summarize`
**Descripción**: Resume un texto usando Perplexity AI.

**Autenticación**: No requerida (servicio interno)

**Body (JSON)**:
```json
{
  "texto": "string (requerido)"
}
```

**Respuesta Exitosa (200)**:
```json
{
  "status": "success",
  "resumen": "string (resumen del texto)"
}
```

**Errores**:
- `400`: Error en la petición
- `500`: Error al resumir texto / API key no configurada

**Timeout**: 30 segundos

---

### 7.3. GET `/`
**Descripción**: Información del servicio.

**Respuesta Exitosa (200)**:
```json
{
  "message": "NotAr IA Service",
  "status": "running"
}
```

---

### 7.4. GET `/health`
**Descripción**: Health check del servicio de IA.

**Respuesta Exitosa (200)**:
```json
{
  "status": "ok"
}
```

---

## 📊 Resumen de Endpoints

### Backend API (Node.js) - Total: 15 endpoints

| Método | Ruta | Autenticación | Rate Limit | Rol Requerido |
|--------|------|---------------|------------|---------------|
| POST | `/api/auth/register` | ❌ | ❌ | - |
| POST | `/api/auth/login` | ❌ | ❌ | - |
| POST | `/api/notas` | ✅ | ❌ | Cualquiera |
| GET | `/api/notas/user/me` | ✅ | ❌ | Cualquiera |
| GET | `/api/notas/mas-buscadas` | ✅ | ❌ | Cualquiera |
| GET | `/api/notas/:id` | ✅ | ❌ | Cualquiera |
| GET | `/api/cuestionarios/nota/:id_nota` | ✅ | ❌ | Cualquiera |
| GET | `/api/cuestionarios/:id` | ✅ | ❌ | Cualquiera |
| GET | `/api/cuestionarios/:id_cuestionario/preguntas` | ✅ | ❌ | Cualquiera |
| GET | `/api/cuestionarios/preguntas/:id` | ✅ | ❌ | Cualquiera |
| POST | `/api/ia/generate` | ✅ | ✅ (5/min) | Cualquiera |
| POST | `/api/ia/summarize` | ✅ | ✅ (5/min) | Cualquiera |
| GET | `/api/prompts/active` | ✅ | ❌ | Cualquiera |
| GET | `/api/prompts` | ✅ | ❌ | Superadmin |
| GET | `/api/prompts/:id` | ✅ | ❌ | Superadmin |
| POST | `/api/prompts` | ✅ | ❌ | Superadmin |
| GET | `/health` | ❌ | ❌ | - |

### Servicio de IA (Python) - Total: 4 endpoints

| Método | Ruta | Autenticación | Rate Limit |
|--------|------|---------------|------------|
| POST | `/api/v1/generate` | ❌ | ❌ |
| POST | `/api/v1/summarize` | ❌ | ❌ |
| GET | `/` | ❌ | ❌ |
| GET | `/health` | ❌ | ❌ |

---

## 🔒 Seguridad y Validaciones

### Autenticación JWT
- **Expiración**: 7 días
- **Header**: `Authorization: Bearer <token>`
- **Payload**: `{ id: number, email: string }`

### Rate Limiting
- **Endpoints de IA**: 5 peticiones por minuto
- **Otros endpoints**: Sin límite

### Validaciones
- **express-validator**: Validación de entrada en todas las rutas
- **Pydantic**: Validación en el servicio de IA
- **SQL Injection Protection**: Consultas parametrizadas

### Roles
- **estudiante**: Rol por defecto
- **admin**: Permisos administrativos (no usado actualmente)
- **superadmin**: Acceso completo, solo puede haber uno en el sistema

---

## 📝 Notas Importantes

1. **Notas Inmutables**: Las notas no pueden editarse ni eliminarse una vez creadas (diseño intencional).

2. **Sistema de Rachas**: Se actualiza automáticamente al crear notas (manual o por IA).

3. **Persistencia Opcional**: El endpoint `/api/ia/generate` puede generar notas sin guardarlas si `persist: false`.

4. **Transacciones**: Las operaciones complejas (crear nota con cuestionarios) se ejecutan en transacciones.

5. **Prompt Activo**: El sistema usa automáticamente el prompt activo para generar notas con IA.

6. **Cuestionarios Automáticos**: Cuando se genera una nota con IA, se crean automáticamente cuestionarios con preguntas y opciones. Estos se pueden consultar mediante los endpoints de `/api/cuestionarios`.

7. **Permisos de Cuestionarios**: Los usuarios solo pueden acceder a cuestionarios de sus propias notas, excepto admin y superadmin que pueden acceder a todos.

8. **Timeout**: 
   - Generación de notas: 60 segundos
   - Resumen de texto: 30 segundos

---

**Última actualización**: 2024
**Versión del API**: 1.0.0

