-- Agregar columnas de análisis a tabla iniciativas
ALTER TABLE iniciativas
ADD COLUMN descripcion_analisis TEXT,
ADD COLUMN libertad_economica SMALLINT,
ADD COLUMN libertad_cultural SMALLINT,
ADD COLUMN alcance_social SMALLINT,
ADD COLUMN riesgo_corrupcion SMALLINT,
ADD COLUMN justificacion_metricas JSONB,
ADD COLUMN ultima_actualizacion TIMESTAMPTZ;

-- Comentarios para documentar
COMMENT ON COLUMN iniciativas.descripcion_analisis IS 'Análisis detallado de la iniciativa (300-400 caracteres)';
COMMENT ON COLUMN iniciativas.libertad_economica IS 'Métrica de libertad económica (-3 a +4)';
COMMENT ON COLUMN iniciativas.libertad_cultural IS 'Métrica de libertad cultural (-2 a +4)';
COMMENT ON COLUMN iniciativas.alcance_social IS 'Métrica de alcance social (-1 a +4)';
COMMENT ON COLUMN iniciativas.riesgo_corrupcion IS 'Métrica de riesgo de corrupción (-2 a +1)';
COMMENT ON COLUMN iniciativas.justificacion_metricas IS 'JSON con justificaciones de cada métrica';
COMMENT ON COLUMN iniciativas.ultima_actualizacion IS 'Timestamp de última actualización del análisis';

-- Índice para búsquedas de análisis pendientes
CREATE INDEX idx_iniciativas_sin_analizar 
ON iniciativas(numero) 
WHERE ultima_actualizacion IS NULL;
