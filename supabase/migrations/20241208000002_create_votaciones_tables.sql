-- Tabla de sesiones de votación
CREATE TABLE IF NOT EXISTS sesiones_votacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_congreso INTEGER UNIQUE NOT NULL,
  tipo_sesion VARCHAR(50) NOT NULL, -- Extraordinaria, Ordinaria, etc.
  numero INTEGER NOT NULL,
  descripcion TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE NOT NULL,
  fase INTEGER,
  url_votaciones TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de votaciones individuales dentro de una sesión
CREATE TABLE IF NOT EXISTS votaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sesion_id UUID REFERENCES sesiones_votacion(id) ON DELETE CASCADE,
  id_congreso INTEGER UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50), -- Punto de agenda, dictamen, moción, etc.
  fecha_votacion TIMESTAMP WITH TIME ZONE,
  resultado VARCHAR(20), -- Aprobado, Rechazado, etc.
  votos_favor INTEGER DEFAULT 0,
  votos_contra INTEGER DEFAULT 0,
  votos_abstencion INTEGER DEFAULT 0,
  votos_ausentes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla de votos individuales por diputado
CREATE TABLE IF NOT EXISTS votos_diputados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  votacion_id UUID REFERENCES votaciones(id) ON DELETE CASCADE,
  diputado_id UUID REFERENCES diputados(id) ON DELETE CASCADE,
  voto VARCHAR(20) NOT NULL, -- Favor, Contra, Abstencion, Ausente
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(votacion_id, diputado_id)
);

-- Índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_sesiones_fecha ON sesiones_votacion(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_sesiones_tipo ON sesiones_votacion(tipo_sesion);
CREATE INDEX IF NOT EXISTS idx_votaciones_sesion ON votaciones(sesion_id);
CREATE INDEX IF NOT EXISTS idx_votaciones_fecha ON votaciones(fecha_votacion DESC);
CREATE INDEX IF NOT EXISTS idx_votos_votacion ON votos_diputados(votacion_id);
CREATE INDEX IF NOT EXISTS idx_votos_diputado ON votos_diputados(diputado_id);

-- Trigger para updated_at
CREATE TRIGGER update_sesiones_votacion_updated_at
  BEFORE UPDATE ON sesiones_votacion
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_votaciones_updated_at
  BEFORE UPDATE ON votaciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE sesiones_votacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE votaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE votos_diputados ENABLE ROW LEVEL SECURITY;

-- Permitir lectura pública
CREATE POLICY "Permitir lectura de sesiones" ON sesiones_votacion FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de votaciones" ON votaciones FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de votos" ON votos_diputados FOR SELECT USING (true);

-- Permitir inserción (para el script de importación)
CREATE POLICY "Permitir inserción de sesiones" ON sesiones_votacion FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción de votaciones" ON votaciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserción de votos" ON votos_diputados FOR INSERT WITH CHECK (true);

COMMENT ON TABLE sesiones_votacion IS 'Sesiones del Congreso donde se realizan votaciones';
COMMENT ON TABLE votaciones IS 'Votaciones específicas dentro de cada sesión';
COMMENT ON TABLE votos_diputados IS 'Voto individual de cada diputado en cada votación';
