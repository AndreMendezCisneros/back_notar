-- Crear tabla prompt_version para almacenar versiones de prompts del sistema
-- Esta tabla permite gestionar diferentes versiones de prompts para la generación de notas con IA

CREATE TABLE IF NOT EXISTS prompt_version (
    id_version SERIAL PRIMARY KEY,
    numero_version VARCHAR(50) NOT NULL,
    descripcion TEXT,
    contenido_prompt TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índice para mejorar las consultas por fecha
CREATE INDEX IF NOT EXISTS idx_prompt_version_fecha_creacion ON prompt_version(fecha_creacion DESC);

-- Comentarios para documentación
COMMENT ON TABLE prompt_version IS 'Tabla para almacenar versiones de prompts utilizados para la generación de notas educativas con IA';
COMMENT ON COLUMN prompt_version.id_version IS 'Identificador único de la versión del prompt';
COMMENT ON COLUMN prompt_version.numero_version IS 'Número de versión del prompt (ej: 1.0, 1.1, 2.0)';
COMMENT ON COLUMN prompt_version.descripcion IS 'Descripción de los cambios o características de esta versión';
COMMENT ON COLUMN prompt_version.contenido_prompt IS 'Contenido completo del prompt. Puede contener placeholders {tema} y {contexto}';
COMMENT ON COLUMN prompt_version.fecha_creacion IS 'Fecha y hora de creación de esta versión del prompt';

