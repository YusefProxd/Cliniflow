-- ============================================
-- SCRIPT DE LIMPIEZA
-- ============================================
-- Ejecuta este script PRIMERO si tienes errores
-- Limpia todas las configuraciones anteriores

-- ============================================
-- 1. ELIMINAR TRIGGERS
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_google_oauth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trigger_generar_codigo_usuario ON usuarios;
DROP TRIGGER IF EXISTS actualizar_usuarios_actualizado_en ON usuarios;

-- ============================================
-- 2. ELIMINAR FUNCIONES
-- ============================================
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_google_oauth_user() CASCADE;
DROP FUNCTION IF EXISTS generar_codigo_usuario() CASCADE;

-- ============================================
-- 3. VERIFICAR LIMPIEZA
-- ============================================
SELECT 
    'Triggers eliminados' as estado,
    COUNT(*) as cantidad
FROM information_schema.triggers
WHERE trigger_name IN (
    'on_auth_user_created',
    'on_google_oauth_user_created',
    'trigger_generar_codigo_usuario'
);

-- Debería mostrar 0

-- ============================================
-- SIGUIENTE PASO
-- ============================================
-- Después de ejecutar este script:
-- 1. Ejecuta supabase/setup_completo.sql
-- 2. Verifica que los triggers se crearon
-- 3. Prueba el registro
