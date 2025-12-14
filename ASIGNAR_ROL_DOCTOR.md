# Guía para Asignar Rol de Doctor

## 📋 Resumen

Por defecto, **todos los usuarios que se registran en CliniFlow son PACIENTES**. Para convertir un usuario en doctor, debes hacerlo manualmente desde Supabase usando los scripts SQL proporcionados.

---

## 🚀 Pasos Rápidos para Crear un Doctor

### Opción 1: Script Simplificado (Recomendado)

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a **SQL Editor**

2. **Copia y pega este script:**

```sql
DO $$
DECLARE
    v_usuario_id UUID;
    v_email TEXT := 'doctor@ejemplo.com'; -- CAMBIAR ESTE EMAIL
BEGIN
    SELECT id INTO v_usuario_id 
    FROM usuarios 
    WHERE email = v_email;

    IF v_usuario_id IS NULL THEN
        RAISE EXCEPTION 'Usuario con email % no encontrado', v_email;
    END IF;

    UPDATE usuarios SET rol = 'doctor' WHERE id = v_usuario_id;
    DELETE FROM pacientes WHERE usuario_id = v_usuario_id;

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
```

3. **Modifica el email:**
   - Cambia `'doctor@ejemplo.com'` por el email del usuario que quieres convertir

4. **Ejecuta el script:**
   - Haz clic en **Run** o presiona `Ctrl + Enter`

5. **Verifica:**
   - Deberías ver el mensaje: "Usuario [email] convertido a doctor exitosamente"

---

## 📝 Actualizar Información del Doctor

Después de crear el doctor, actualiza su información profesional:

```sql
UPDATE doctores 
SET 
    especialidad = 'Cardiología',
    anos_experiencia = 10,
    educacion = 'Universidad Nacional Mayor de San Marcos',
    certificaciones = ARRAY['Cardiología Clínica', 'Ecocardiografía'],
    biografia = 'Especialista en enfermedades cardiovasculares',
    tarifa_consulta = 150.00
WHERE usuario_id = (
    SELECT id FROM usuarios WHERE email = 'doctor@ejemplo.com'
);
```

**Campos disponibles:**
- `especialidad` - Especialidad médica (ej: Cardiología, Pediatría)
- `anos_experiencia` - Años de experiencia (número entero)
- `educacion` - Universidad o institución educativa
- `certificaciones` - Array de certificaciones (ej: `ARRAY['Cert1', 'Cert2']`)
- `biografia` - Descripción profesional
- `tarifa_consulta` - Precio de consulta en soles (decimal)

---

## 🔍 Consultas Útiles

### Ver todos los pacientes:
```sql
SELECT id, email, nombre_completo, rol, creado_en
FROM usuarios
WHERE rol = 'paciente'
ORDER BY creado_en DESC;
```

### Ver todos los doctores:
```sql
SELECT 
    u.email,
    u.nombre_completo,
    d.especialidad,
    d.numero_licencia,
    d.anos_experiencia,
    d.tarifa_consulta
FROM usuarios u
INNER JOIN doctores d ON d.usuario_id = u.id
WHERE u.rol = 'doctor'
ORDER BY d.creado_en DESC;
```

### Ver información completa de un doctor específico:
```sql
SELECT 
    u.email,
    u.nombre_completo,
    d.*
FROM usuarios u
INNER JOIN doctores d ON d.usuario_id = u.id
WHERE u.email = 'doctor@ejemplo.com';
```

---

## ↩️ Revertir: Convertir Doctor en Paciente

Si necesitas revertir el cambio:

```sql
DO $$
DECLARE
    v_usuario_id UUID;
    v_email TEXT := 'doctor@ejemplo.com'; -- CAMBIAR ESTE EMAIL
BEGIN
    SELECT id INTO v_usuario_id 
    FROM usuarios 
    WHERE email = v_email;

    UPDATE usuarios SET rol = 'paciente' WHERE id = v_usuario_id;
    DELETE FROM doctores WHERE usuario_id = v_usuario_id;
    INSERT INTO pacientes (usuario_id) VALUES (v_usuario_id);

    RAISE NOTICE 'Usuario % convertido a paciente exitosamente', v_email;
END $$;
```

---

## ⚠️ Notas Importantes

1. **Registro automático**: Todos los nuevos usuarios se registran como pacientes
2. **Conversión manual**: Solo los administradores pueden convertir pacientes en doctores
3. **Datos requeridos**: Al crear un doctor, se requiere al menos:
   - Especialidad
   - Número de licencia (se genera automáticamente)
   - Tarifa de consulta
4. **Permisos**: Los doctores tienen acceso a:
   - Ver todos los pacientes
   - Crear y editar historiales médicos
   - Emitir recetas
   - Gestionar sus citas

---

## 📚 Archivo de Scripts

Todos los scripts están disponibles en:
```
supabase/asignar_rol_doctor.sql
```

Este archivo incluye:
- ✅ Script simplificado para crear doctores
- ✅ Script para actualizar información de doctores
- ✅ Script para listar usuarios
- ✅ Script para revertir cambios
- ✅ Ejemplos y documentación completa

---

## 🆘 Solución de Problemas

### Error: "Usuario con email X no encontrado"
- **Causa**: El email no existe en la base de datos
- **Solución**: Verifica que el usuario se haya registrado primero

### Error: "duplicate key value violates unique constraint"
- **Causa**: El usuario ya es un doctor
- **Solución**: Verifica el rol actual con la consulta de "Ver todos los doctores"

### El doctor no puede acceder al dashboard
- **Causa**: El rol no se actualizó correctamente
- **Solución**: Ejecuta la consulta de verificación y asegúrate de que el rol sea 'doctor'

---

## 📞 Flujo Completo de Ejemplo

```sql
-- 1. Verificar que el usuario existe
SELECT id, email, nombre_completo, rol 
FROM usuarios 
WHERE email = 'juan.perez@ejemplo.com';

-- 2. Convertir a doctor (si existe)
DO $$
DECLARE
    v_usuario_id UUID;
    v_email TEXT := 'juan.perez@ejemplo.com';
BEGIN
    SELECT id INTO v_usuario_id FROM usuarios WHERE email = v_email;
    UPDATE usuarios SET rol = 'doctor' WHERE id = v_usuario_id;
    DELETE FROM pacientes WHERE usuario_id = v_usuario_id;
    INSERT INTO doctores (usuario_id, especialidad, numero_licencia, tarifa_consulta) 
    VALUES (v_usuario_id, 'Medicina General', 'LIC-' || SUBSTRING(v_usuario_id::text, 1, 8), 100.00);
END $$;

-- 3. Actualizar información profesional
UPDATE doctores 
SET 
    especialidad = 'Cardiología',
    anos_experiencia = 15,
    educacion = 'UNMSM',
    certificaciones = ARRAY['Cardiología Clínica'],
    biografia = 'Cardiólogo con 15 años de experiencia',
    tarifa_consulta = 180.00
WHERE usuario_id = (SELECT id FROM usuarios WHERE email = 'juan.perez@ejemplo.com');

-- 4. Verificar
SELECT u.email, u.nombre_completo, d.especialidad, d.tarifa_consulta
FROM usuarios u
INNER JOIN doctores d ON d.usuario_id = u.id
WHERE u.email = 'juan.perez@ejemplo.com';
```

¡Listo! El doctor ya puede acceder a su dashboard en `/dashboard/doctor` 🎉
