-- ============================================
-- SCRIPTS PARA ASIGNAR ROL DE DOCTOR
-- ============================================
-- Estos scripts deben ejecutarse desde el SQL Editor de Supabase
-- para convertir un paciente en doctor manualmente.

-- ============================================
-- 1. LISTAR TODOS LOS USUARIOS PACIENTES
-- ============================================
-- Usa este query para ver todos los usuarios que son pacientes
-- y obtener su ID para convertirlos en doctores

SELECT 
    u.id as usuario_id,
    u.email,
    u.nombre_completo,
    u.rol,
    u.creado_en
FROM usuarios u
WHERE u.rol = 'paciente'
ORDER BY u.creado_en DESC;


-- ============================================
-- 2. CONVERTIR UN PACIENTE EN DOCTOR
-- ============================================
-- Reemplaza 'EMAIL_DEL_USUARIO' con el email del usuario que quieres convertir en doctor
-- Este script hace lo siguiente:
-- 1. Cambia el rol del usuario de 'paciente' a 'doctor'
-- 2. Elimina el registro de la tabla pacientes (si existe)
-- 3. Crea un registro en la tabla doctores

-- IMPORTANTE: Ejecuta todo este bloque como una transacción

BEGIN;

-- Paso 1: Actualizar el rol del usuario
UPDATE usuarios 
SET rol = 'doctor'
WHERE email = 'EMAIL_DEL_USUARIO';

-- Paso 2: Obtener el ID del usuario y eliminar de tabla pacientes
DELETE FROM pacientes 
WHERE usuario_id = (
    SELECT id FROM usuarios WHERE email = 'EMAIL_DEL_USUARIO'
);

-- Paso 3: Crear registro en tabla doctores
-- Reemplaza los valores según corresponda
INSERT INTO doctores (
    usuario_id,
    especialidad,
    numero_licencia,
    anos_experiencia,
    educacion,
    certificaciones,
    biografia,
    tarifa_consulta
)
SELECT 
    id,
    'Especialidad del Doctor',                    -- Cambiar por la especialidad
    'LIC-' || SUBSTRING(id::text, 1, 8),         -- Genera un número de licencia único
    0,                                            -- Años de experiencia
    'Universidad',                                -- Educación
    ARRAY['Certificación 1', 'Certificación 2'], -- Certificaciones
    'Biografía del doctor',                       -- Biografía
    100.00                                        -- Tarifa de consulta en soles
FROM usuarios 
WHERE email = 'EMAIL_DEL_USUARIO';

COMMIT;


-- ============================================
-- 3. SCRIPT SIMPLIFICADO (SOLO CAMBIAR EMAIL)
-- ============================================
-- Copia y pega este script, solo cambia el email

DO $$
DECLARE
    v_usuario_id UUID;
    v_email TEXT := 'doctor@ejemplo.com'; -- CAMBIAR ESTE EMAIL
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO v_usuario_id 
    FROM usuarios 
    WHERE email = v_email;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', v_email;
    END IF;

    -- Actualizar rol
    UPDATE usuarios 
    SET rol = 'doctor'
    WHERE id = v_usuario_id;

    -- Eliminar de pacientes si existe
    DELETE FROM pacientes WHERE usuario_id = v_usuario_id;

    -- Crear registro de doctor
    INSERT INTO doctores (
        usuario_id,
        especialidad,
        numero_licencia,
        anos_experiencia,
        tarifa_consulta
    ) VALUES (
        v_usuario_id,
        'Medicina General',
        'LIC-' || SUBSTRING(v_usuario_id::text, 1, 8),
        0,
        100.00
    );

    RAISE NOTICE 'Usuario % convertido a doctor exitosamente', v_email;
END $$;


-- ============================================
-- 4. ACTUALIZAR INFORMACIÓN DE UN DOCTOR EXISTENTE
-- ============================================
-- Para actualizar la información de un doctor ya creado

UPDATE doctores 
SET 
    especialidad = 'Cardiología',
    anos_experiencia = 10,
    educacion = 'Universidad Nacional Mayor de San Marcos',
    certificaciones = ARRAY['Cardiología Clínica', 'Ecocardiografía'],
    biografia = 'Especialista en enfermedades cardiovasculares con 10 años de experiencia',
    tarifa_consulta = 150.00
WHERE usuario_id = (
    SELECT id FROM usuarios WHERE email = 'EMAIL_DEL_DOCTOR'
);


-- ============================================
-- 5. VERIFICAR DOCTORES REGISTRADOS
-- ============================================
-- Ver todos los doctores con su información completa

SELECT 
    u.email,
    u.nombre_completo,
    d.especialidad,
    d.numero_licencia,
    d.anos_experiencia,
    d.tarifa_consulta,
    d.creado_en
FROM usuarios u
INNER JOIN doctores d ON d.usuario_id = u.id
WHERE u.rol = 'doctor'
ORDER BY d.creado_en DESC;


-- ============================================
-- 6. REVERTIR: CONVERTIR DOCTOR EN PACIENTE
-- ============================================
-- Si necesitas revertir el cambio

DO $$
DECLARE
    v_usuario_id UUID;
    v_email TEXT := 'doctor@ejemplo.com'; -- CAMBIAR ESTE EMAIL
BEGIN
    -- Obtener el ID del usuario
    SELECT id INTO v_usuario_id 
    FROM usuarios 
    WHERE email = v_email;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', v_email;
    END IF;

    -- Actualizar rol
    UPDATE usuarios 
    SET rol = 'paciente'
    WHERE id = v_usuario_id;

    -- Eliminar de doctores
    DELETE FROM doctores WHERE usuario_id = v_usuario_id;

    -- Crear registro de paciente
    INSERT INTO pacientes (usuario_id) 
    VALUES (v_usuario_id);

    RAISE NOTICE 'Usuario % convertido a paciente exitosamente', v_email;
END $$;


-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. Todos los usuarios se registran como PACIENTES por defecto
-- 2. Para crear un DOCTOR, debes ejecutar uno de los scripts anteriores
-- 3. Recomendación: Usa el script #3 (simplificado) para conversiones rápidas
-- 4. Después de crear un doctor, usa el script #4 para actualizar su información
-- 5. Siempre verifica con el script #5 que el doctor fue creado correctamente
