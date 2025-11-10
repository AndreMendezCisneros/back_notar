# Scripts SQL para NotAr

## Crear tabla prompt_version

Este script crea la tabla `prompt_version` necesaria para gestionar las versiones de prompts del sistema.

### Ejecución

#### Opción 1: Desde Supabase Dashboard
1. Ve a tu proyecto en Supabase
2. Abre el SQL Editor
3. Copia y pega el contenido de `create_prompt_table.sql`
4. Ejecuta el script

#### Opción 2: Desde psql (línea de comandos)
```bash
psql -h tu-host.supabase.co -U postgres -d postgres -f sql/create_prompt_table.sql
```

#### Opción 3: Desde Node.js (usando pg)
```bash
# Instalar pg si no lo tienes
npm install pg

# Ejecutar el script
node -e "require('pg').Client.connect('postgresql://usuario:password@host:5432/database').then(client => client.query(require('fs').readFileSync('sql/create_prompt_table.sql', 'utf8')).then(() => { console.log('Tabla creada exitosamente'); process.exit(0); })).catch(err => { console.error(err); process.exit(1); })"
```

### Estructura de la tabla

La tabla `prompt_version` contiene:
- `id_version`: SERIAL PRIMARY KEY - Identificador único
- `numero_version`: VARCHAR(50) - Número de versión (ej: "1.0", "1.1")
- `descripcion`: TEXT - Descripción de la versión
- `contenido_prompt`: TEXT - Contenido del prompt (puede contener {tema} y {contexto})
- `fecha_creacion`: TIMESTAMP - Fecha de creación

### Notas

- El prompt activo es el más reciente (por fecha_creacion e id_version)
- Los prompts pueden contener placeholders `{tema}` y `{contexto}` que se reemplazarán automáticamente
- La tabla incluye un índice para mejorar las consultas por fecha

