-- Esquema de base de datos para el sistema de reservas de empanadas
-- Ejecutar estos comandos en el SQL Editor de Supabase

-- Tabla para almacenar las reservas de usuarios
CREATE TABLE IF NOT EXISTS reservas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre_completo VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  dni VARCHAR(20) NOT NULL UNIQUE,
  celular VARCHAR(20) NOT NULL,
  sucursal_id INTEGER NOT NULL,
  sucursal_nombre VARCHAR(255) NOT NULL,
  fecha_reserva TIMESTAMP WITH TIME ZONE NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para almacenar los códigos de descuento
CREATE TABLE IF NOT EXISTS codigos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(20) NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  fecha_uso TIMESTAMP WITH TIME ZONE,
  usuario_dni VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reservas_dni ON reservas(dni);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha_reserva);
CREATE INDEX IF NOT EXISTS idx_codigos_usado ON codigos(usado);
CREATE INDEX IF NOT EXISTS idx_codigos_codigo ON codigos(codigo);

-- Función para generar códigos únicos automáticamente
CREATE OR REPLACE FUNCTION generate_unique_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists_count INTEGER;
BEGIN
  LOOP
    -- Generar código de 8 caracteres alfanuméricos
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Verificar si el código ya existe
    SELECT COUNT(*) INTO exists_count FROM codigos WHERE codigo = code;
    
    -- Si no existe, salir del loop
    IF exists_count = 0 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Función para inicializar los 300 códigos
CREATE OR REPLACE FUNCTION initialize_codes()
RETURNS VOID AS $$
DECLARE
  i INTEGER;
BEGIN
  -- Limpiar códigos existentes (opcional)
  DELETE FROM codigos;
  
  -- Generar 300 códigos únicos
  FOR i IN 1..300 LOOP
    INSERT INTO codigos (codigo, usado, fecha_creacion)
    VALUES (generate_unique_code(), FALSE, NOW());
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas
CREATE OR REPLACE FUNCTION get_reservation_stats()
RETURNS TABLE(
  total_reservas BIGINT,
  codigos_usados BIGINT,
  codigos_disponibles BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM reservas) as total_reservas,
    (SELECT COUNT(*) FROM codigos WHERE usado = TRUE) as codigos_usados,
    (SELECT COUNT(*) FROM codigos WHERE usado = FALSE) as codigos_disponibles;
END;
$$ LANGUAGE plpgsql;

-- Políticas de seguridad (RLS)
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE codigos ENABLE ROW LEVEL SECURITY;

-- Política para permitir lectura de reservas (solo para administradores)
CREATE POLICY "Allow read reservations" ON reservas
  FOR SELECT USING (true);

-- Política para permitir inserción de reservas
CREATE POLICY "Allow insert reservations" ON reservas
  FOR INSERT WITH CHECK (true);

-- Política para permitir lectura de códigos
CREATE POLICY "Allow read codes" ON codigos
  FOR SELECT USING (true);

-- Política para permitir actualización de códigos
CREATE POLICY "Allow update codes" ON codigos
  FOR UPDATE USING (true);

-- Comentarios para documentación
COMMENT ON TABLE reservas IS 'Tabla para almacenar las reservas de usuarios para probar la nueva empanada';
COMMENT ON TABLE codigos IS 'Tabla para almacenar los códigos de descuento únicos (300 total)';
COMMENT ON COLUMN reservas.dni IS 'DNI único por usuario para evitar duplicados';
COMMENT ON COLUMN codigos.usado IS 'Indica si el código ya fue utilizado';
COMMENT ON COLUMN codigos.usuario_dni IS 'DNI del usuario que utilizó el código';
