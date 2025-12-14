-- ============================================
-- SOLUCIÓN: CREAR USUARIOS CON RPC
-- ============================================
-- Como los triggers en auth.users pueden no funcionar,
-- usaremos una función RPC que se llama desde la aplicación

-- ============================================
-- 1. FUNCIÓN PARA CREAR USUARIO COMPLETO
-- ============================================
CREATE OR REPLACE FUNCTION create_user_profile(
    p_user_id UUID,
    p_email TEXT,
    p_nombre_completo TEXT,
    p_rol TEXT DEFAULT 'paciente'
)
RETURNS JSON AS $$
DECLARE
    v_codigo_usuario TEXT;
    v_usuario_id UUID;
    v_paciente_id UUID;
BEGIN
    -- Insertar en tabla usuarios (el trigger generará el código)
    INSERT INTO public.usuarios (id, email, nombre_completo, rol)
    VALUES (p_user_id, p_email, p_nombre_completo, p_rol)
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        nombre_completo = EXCLUDED.nombre_completo,
        rol = EXCLUDED.rol
    RETURNING id, codigo_usuario INTO v_usuario_id, v_codigo_usuario;

    -- Si es paciente, crear registro en tabla pacientes
    IF p_rol = 'paciente' THEN
        INSERT INTO public.pacientes (usuario_id)
        VALUES (p_user_id)
        ON CONFLICT (usuario_id) DO NOTHING
        RETURNING id INTO v_paciente_id;
    END IF;

    -- Retornar información
    RETURN json_build_object(
        'success', true,
        'usuario_id', v_usuario_id,
        'codigo_usuario', v_codigo_usuario,
        'paciente_id', v_paciente_id,
        'rol', p_rol
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. DAR PERMISOS A LA FUNCIÓN
-- ============================================
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;

-- ============================================
-- 3. POLÍTICA PARA PERMITIR INSERCIONES
-- ============================================
-- Permitir que los usuarios autenticados inserten su propio perfil
DROP POLICY IF EXISTS "Usuarios pueden crear su propio perfil" ON usuarios;
CREATE POLICY "Usuarios pueden crear su propio perfil" ON usuarios
    FOR INSERT
    WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Usuarios pueden crear su propio registro de paciente" ON pacientes;
CREATE POLICY "Usuarios pueden crear su propio registro de paciente" ON pacientes
    FOR INSERT
    WITH CHECK (auth.uid() = usuario_id);

-- ============================================
-- 4. VERIFICAR FUNCIÓN
-- ============================================
-- Probar la función (reemplaza con un UUID real de auth.users)
-- SELECT create_user_profile(
--     'uuid-del-usuario'::uuid,
--     'test@ejemplo.com',
--     'Usuario Prueba',
--     'paciente'
-- );
