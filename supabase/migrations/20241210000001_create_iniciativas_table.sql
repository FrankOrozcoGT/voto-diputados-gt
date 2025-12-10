-- Tabla de iniciativas legislativas
CREATE TABLE iniciativas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(10) NOT NULL UNIQUE,
  fecha DATE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT, -- Se llenará manualmente leyendo los TXT
  pdf_url TEXT,
  detalle_url TEXT,
  tiene_votaciones BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_iniciativas_numero ON iniciativas(numero);
CREATE INDEX idx_iniciativas_fecha ON iniciativas(fecha DESC);
CREATE INDEX idx_iniciativas_votaciones ON iniciativas(tiene_votaciones) WHERE tiene_votaciones = TRUE;

-- RLS
ALTER TABLE iniciativas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Iniciativas son públicas" ON iniciativas
  FOR SELECT USING (true);

-- Trigger para updated_at
CREATE TRIGGER set_iniciativas_updated_at
  BEFORE UPDATE ON iniciativas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
