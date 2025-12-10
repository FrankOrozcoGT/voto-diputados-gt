-- Agregar columna iniciativa a votaciones
ALTER TABLE votaciones 
ADD COLUMN iniciativa VARCHAR(10);

-- Índice para búsquedas por iniciativa
CREATE INDEX idx_votaciones_iniciativa ON votaciones(iniciativa);

-- Comentario
COMMENT ON COLUMN votaciones.iniciativa IS 'Número de iniciativa asociada a esta votación';
