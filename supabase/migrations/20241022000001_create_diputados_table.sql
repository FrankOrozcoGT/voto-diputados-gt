-- Crear tabla de diputados
CREATE TABLE diputados (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellidos VARCHAR(150) NOT NULL,
  partido_politico VARCHAR(100) NOT NULL,
  distrito VARCHAR(100) NOT NULL,
  departamento VARCHAR(50) NOT NULL,
  numero_lista INTEGER NOT NULL,
  foto_url TEXT,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_diputados_activo ON diputados(activo);
CREATE INDEX idx_diputados_partido ON diputados(partido_politico);
CREATE INDEX idx_diputados_departamento ON diputados(departamento);
CREATE INDEX idx_diputados_numero_lista ON diputados(numero_lista);
CREATE INDEX idx_diputados_activo_partido_lista 
ON diputados(activo, partido_politico, numero_lista);

-- Configurar Row Level Security (RLS)
ALTER TABLE diputados ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura pública
CREATE POLICY "Permitir lectura pública de diputados" 
ON diputados FOR SELECT 
USING (true);

-- Función para actualizar el campo updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para ejecutar la función
CREATE TRIGGER update_diputados_updated_at 
    BEFORE UPDATE ON diputados 
    FOR EACH ROW 
    EXECUTE PROCEDURE update_updated_at_column();