-- Crear tabla de partidos políticos
CREATE TABLE IF NOT EXISTS partidos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  prefijo VARCHAR(50) NOT NULL UNIQUE,
  color VARCHAR(7),
  logo_url TEXT,
  sitio_web TEXT,
  email VARCHAR(100),
  telefono VARCHAR(50),
  direccion TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  youtube TEXT,
  anio_creacion INTEGER,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_partidos_activo ON partidos(activo);
CREATE INDEX IF NOT EXISTS idx_partidos_prefijo ON partidos(prefijo);

-- Configurar RLS
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de partidos" 
ON partidos FOR SELECT 
USING (true);

-- Trigger para updated_at
CREATE TRIGGER update_partidos_updated_at 
    BEFORE UPDATE ON partidos 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();

-- Modificar tabla diputados para agregar columnas nuevas
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS partido_id UUID REFERENCES partidos(id);
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS fecha_nacimiento DATE;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS edad INTEGER;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS cv_url TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS id_congreso VARCHAR(50) UNIQUE;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS whatsapp VARCHAR(50);
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS facebook TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS twitter TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS instagram TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS youtube TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS cargo_bloque VARCHAR(100);
ALTER TABLE diputados ADD COLUMN IF NOT EXISTS etiqueta VARCHAR(50);

-- Crear índice para la relación
CREATE INDEX IF NOT EXISTS idx_diputados_partido_id ON diputados(partido_id);
