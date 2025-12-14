-- ============================================
-- AGREGAR ID LEGIBLE PARA USUARIOS
-- ============================================
-- Este script agrega un campo 'codigo_usuario' que es un ID legible
-- como PAC-00001, DOC-00001, etc.

-- ============================================
-- 1. AGREGAR COLUMNA A LA TABLA USUARIOS
-- ============================================
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS codigo_usuario TEXT UNIQUE;

-- ============================================
-- 2. CREAR SECUENCIAS PARA CADA TIPO DE USUARIO
-- ============================================
CREATE SEQUENCE IF NOT EXISTS seq_paciente_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_doctor_id START 1;
CREATE SEQUENCE IF NOT EXISTS seq_admin_id START 1;

-- ============================================
-- 3. FUNCIÓN PARA GENERAR CÓDIGO DE USUARIO
-- ============================================
CREATE OR REPLACE FUNCTION generar_codigo_usuario()
RETURNS TRIGGER AS $$
DECLARE
    v_prefijo TEXT;
    v_numero TEXT;
    v_codigo TEXT;
BEGIN
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
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CREAR TRIGGER PARA GENERAR CÓDIGO AUTOMÁTICAMENTE
-- ============================================
DROP TRIGGER IF EXISTS trigger_generar_codigo_usuario ON usuarios;

CREATE TRIGGER trigger_generar_codigo_usuario
    BEFORE INSERT ON usuarios
    FOR EACH ROW
    WHEN (NEW.codigo_usuario IS NULL)
    EXECUTE FUNCTION generar_codigo_usuario();

-- ============================================
-- 5. GENERAR CÓDIGOS PARA USUARIOS EXISTENTES
-- ============================================
-- Este script genera códigos para usuarios que ya existen en la BD

DO $$
DECLARE
    v_usuario RECORD;
    v_prefijo TEXT;
    v_numero TEXT;
    v_codigo TEXT;
BEGIN
    FOR v_usuario IN 
        SELECT id, rol FROM usuarios WHERE codigo_usuario IS NULL
    LOOP
        -- Determinar prefijo y número
        CASE v_usuario.rol
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
        
        v_codigo := v_prefijo || '-' || v_numero;
        
        -- Actualizar el usuario
        UPDATE usuarios 
        SET codigo_usuario = v_codigo 
        WHERE id = v_usuario.id;
        
        RAISE NOTICE 'Código % asignado al usuario %', v_codigo, v_usuario.id;
    END LOOP;
END $$;

-- ============================================
-- 6. VERIFICAR CÓDIGOS GENERADOS
-- ============================================
SELECT 
    codigo_usuario,
    email,
    nombre_completo,
    rol,
    creado_en
FROM usuarios
ORDER BY creado_en DESC;

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Los códigos se generan automáticamente al crear un usuario
-- 2. Formato: PAC-00001, DOC-00001, ADM-00001
-- 3. Los códigos son únicos y no se pueden duplicar
-- 4. Los códigos no se pueden modificar una vez asignados
-- 5. Si cambias el rol de un usuario, el código NO cambia
