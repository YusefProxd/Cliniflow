-- ============================================
-- TRIGGER PARA CREAR PACIENTE AUTOMÁTICAMENTE
-- ============================================
-- Este script crea un trigger que automáticamente inserta un registro
-- en la tabla 'pacientes' cuando se crea un nuevo usuario con rol 'paciente'

-- ============================================
-- 1. FUNCIÓN PARA MANEJAR NUEVOS USUARIOS
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insertar en la tabla usuarios
    INSERT INTO public.usuarios (id, email, nombre_completo, rol)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente')
    );

    -- Si el rol es 'paciente', crear registro en tabla pacientes
    IF COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente') = 'paciente' THEN
        INSERT INTO public.pacientes (usuario_id)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. CREAR TRIGGER EN auth.users
-- ============================================
-- Primero eliminar el trigger si existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Crear el trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 3. FUNCIÓN PARA MANEJAR USUARIOS DE GOOGLE OAUTH
-- ============================================
-- Esta función maneja específicamente los usuarios que se registran con Google
CREATE OR REPLACE FUNCTION handle_google_oauth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar si el usuario ya existe en la tabla usuarios
    IF NOT EXISTS (SELECT 1 FROM public.usuarios WHERE id = NEW.id) THEN
        -- Insertar en la tabla usuarios
        INSERT INTO public.usuarios (id, email, nombre_completo, rol)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(
                NEW.raw_user_meta_data->>'full_name',
                NEW.raw_user_meta_data->>'name',
                NEW.email
            ),
            'paciente' -- Todos los usuarios de Google son pacientes por defecto
        );

        -- Crear registro en tabla pacientes
        INSERT INTO public.pacientes (usuario_id)
        VALUES (NEW.id);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. TRIGGER ADICIONAL PARA GOOGLE OAUTH
-- ============================================
DROP TRIGGER IF EXISTS on_google_oauth_user_created ON auth.users;

CREATE TRIGGER on_google_oauth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    WHEN (NEW.raw_app_meta_data->>'provider' = 'google')
    EXECUTE FUNCTION handle_google_oauth_user();

-- ============================================
-- 5. MIGRAR USUARIOS EXISTENTES
-- ============================================
-- Este script crea registros de pacientes para usuarios existentes que no los tienen

DO $$
DECLARE
    v_usuario RECORD;
BEGIN
    FOR v_usuario IN 
        SELECT u.id, u.rol
        FROM usuarios u
        LEFT JOIN pacientes p ON p.usuario_id = u.id
        WHERE u.rol = 'paciente' AND p.id IS NULL
    LOOP
        INSERT INTO pacientes (usuario_id)
        VALUES (v_usuario.id);
        
        RAISE NOTICE 'Registro de paciente creado para usuario %', v_usuario.id;
    END LOOP;
END $$;

-- ============================================
-- 6. VERIFICAR CONFIGURACIÓN
-- ============================================
-- Ver usuarios y sus registros de pacientes
SELECT 
    u.id,
    u.codigo_usuario,
    u.email,
    u.nombre_completo,
    u.rol,
    CASE 
        WHEN p.id IS NOT NULL THEN 'Sí'
        ELSE 'No'
    END as tiene_registro_paciente,
    u.creado_en
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
WHERE u.rol = 'paciente'
ORDER BY u.creado_en DESC;

-- ============================================
-- 7. VERIFICAR TRIGGERS ACTIVOS
-- ============================================
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public' OR event_object_schema = 'auth'
ORDER BY trigger_name;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. El trigger se ejecuta automáticamente al crear un usuario
-- 2. Funciona tanto para registro normal como para Google OAuth
-- 3. Si el usuario ya existe, no se duplica el registro
-- 4. Todos los nuevos usuarios pacientes tendrán su registro automáticamente
-- 5. Los usuarios existentes se migran con el script #5
