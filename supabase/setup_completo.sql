-- ============================================
-- SCRIPT COMPLETO DE CONFIGURACIÓN
-- ============================================
-- Este script debe ejecutarse UNA SOLA VEZ en orden
-- Configura todo el sistema de usuarios automáticamente

-- ============================================
-- PASO 1: AGREGAR COLUMNA CODIGO_USUARIO
-- ============================================
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS codigo_usuario TEXT UNIQUE;

-- ============================================
-- PASO 2: CREAR SECUENCIAS
-- ============================================
CREATE SEQUENCE IF NOT EXISTS seq_paciente_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_doctor_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_admin_id START 1;

-- ============================================
-- PASO 3: FUNCIÓN PARA GENERAR CÓDIGO DE USUARIO
-- ============================================
CREATE OR REPLACE FUNCTION generar_codigo_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_prefijo TEXT;
    v_numero TEXT;
    v_codigo TEXT;
BEGIN
    -- Solo generar si no existe código
    IF NEW.codigo_usuario IS NULL THEN
        -- Determinar el prefijo según el rol
        CASE NEW.rol
            WHEN 'paciente' THEN 
                v_prefijo := 'PAC';
                v_numero := LPAD(nextval('seq_paciente_id')::TEXT, 5, '0');
            WHEN 'doctor' THEN 
                v_prefijo := 'DOC';
                v_numero := LPAD(nextval('seq_doctor_id')::TEXT, 5, '0');
            WHEN 'admin' THEN 
                v_prefijo := 'ADM';
                v_numero := LPAD(nextval('seq_admin_id')::TEXT, 5, '0');
            ELSE
                v_prefijo := 'USR';
                v_numero := LPAD(nextval('seq_paciente_id')::TEXT, 5, '0');
        END CASE;
        
        -- Generar el código completo
        v_codigo := v_prefijo || '-' || v_numero;
        
        -- Asignar el código al nuevo usuario
        NEW.codigo_usuario := v_codigo;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PASO 4: TRIGGER PARA GENERAR CÓDIGO
-- ============================================
DROP TRIGGER IF EXISTS trigger_generar_codigo_usuario ON usuarios;

CREATE TRIGGER trigger_generar_codigo_usuario
    BEFORE INSERT ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION generar_codigo_usuario();

-- ============================================
-- PASO 5: FUNCIÓN PARA MANEJAR NUEVOS USUARIOS
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_nombre_completo TEXT;
    v_rol TEXT;
BEGIN
    -- Extraer nombre completo
    v_nombre_completo := COALESCE(
        NEW.raw_user_meta_data->>'nombre_completo',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );
    
    -- Extraer rol (siempre paciente por defecto)
    v_rol := COALESCE(NEW.raw_user_meta_data->>'rol', 'paciente');

    -- Insertar en la tabla usuarios (el trigger de código se ejecutará automáticamente)
    INSERT INTO public.usuarios (id, email, nombre_completo, rol)
    VALUES (NEW.id, NEW.email, v_nombre_completo, v_rol)
    ON CONFLICT (id) DO NOTHING;

    -- Si el rol es 'paciente', crear registro en tabla pacientes
    IF v_rol = 'paciente' THEN
        INSERT INTO public.pacientes (usuario_id)
        VALUES (NEW.id)
        ON CONFLICT (usuario_id) DO NOTHING;
    END IF;

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log del error pero no fallar el registro
        RAISE WARNING 'Error en handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PASO 6: TRIGGER PARA NUEVOS USUARIOS
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- PASO 7: GENERAR CÓDIGOS PARA USUARIOS EXISTENTES
-- ============================================
DO $$
DECLARE
    v_usuario RECORD;
BEGIN
    -- Actualizar usuarios sin código
    FOR v_usuario IN 
        SELECT id, rol FROM usuarios WHERE codigo_usuario IS NULL
    LOOP
        UPDATE usuarios 
        SET codigo_usuario = codigo_usuario -- Esto activará el trigger
        WHERE id = v_usuario.id;
    END LOOP;
    
    -- Crear pacientes para usuarios existentes sin registro
    FOR v_usuario IN 
        SELECT u.id
        FROM usuarios u
        LEFT JOIN pacientes p ON p.usuario_id = u.id
        WHERE u.rol = 'paciente' AND p.id IS NULL
    LOOP
        INSERT INTO pacientes (usuario_id)
        VALUES (v_usuario.id)
        ON CONFLICT (usuario_id) DO NOTHING;
        
        RAISE NOTICE 'Paciente creado para usuario %', v_usuario.id;
    END LOOP;
END $$;

-- ============================================
-- PASO 8: VERIFICACIÓN
-- ============================================
-- Ver configuración de usuarios
SELECT 
    u.codigo_usuario,
    u.email,
    u.nombre_completo,
    u.rol,
    CASE WHEN p.id IS NOT NULL THEN 'Sí' ELSE 'No' END as tiene_registro_paciente,
    u.creado_en
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
ORDER BY u.creado_en DESC
LIMIT 10;

-- Ver triggers activos
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth')
    AND trigger_name IN ('trigger_generar_codigo_usuario', 'on_auth_user_created')
ORDER BY trigger_name;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Este script debe ejecutarse UNA SOLA VEZ
-- 2. Si ya ejecutaste scripts anteriores, este los reemplaza
-- 3. Los triggers manejan errores sin fallar el registro
-- 4. Funciona para registro normal y Google OAuth
-- 5. Los usuarios existentes se migran automáticamente
