-- SQL para actualizar la base de datos con los nuevos campos de perfil
-- EJECUTAR ESTO EN EL EDITOR SQL DE SUPABASE

-- 1. Agregar las nuevas columnas a la tabla profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS language VARCHAR(5) DEFAULT 'es-ES',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'America/Mexico_City';

-- 2. Actualizar perfiles existentes con valores por defecto si están vacíos
UPDATE public.profiles 
SET 
  preferred_currency = COALESCE(preferred_currency, 'USD'),
  language = COALESCE(language, 'es-ES'),
  timezone = COALESCE(timezone, 'America/Mexico_City')
WHERE 
  preferred_currency IS NULL 
  OR language IS NULL 
  OR timezone IS NULL;

-- 3. Crear función para actualizar el timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Crear trigger para actualizar automáticamente updated_at en profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Verificar que los datos se hayan actualizado correctamente
SELECT id, username, full_name, preferred_currency, language, timezone, created_at, updated_at
FROM public.profiles
LIMIT 5;