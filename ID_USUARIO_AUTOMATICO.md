# Guía: Agregar ID de Usuario Automático

## 📋 Resumen

Cada usuario ahora tendrá un **ID único legible** que se genera automáticamente al registrarse:
- **Pacientes**: `PAC-00001`, `PAC-00002`, etc.
- **Doctores**: `DOC-00001`, `DOC-00002`, etc.
- **Administradores**: `ADM-00001`, `ADM-00002`, etc.

Este ID se muestra en el perfil del usuario y **no puede ser editado**.

---

## 🚀 Instalación (Solo una vez)

### Paso 1: Ejecutar el Script SQL

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a **SQL Editor**

2. **Copia y pega el script completo:**
   - Abre el archivo `supabase/agregar_codigo_usuario.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase

3. **Ejecuta el script:**
   - Haz clic en **Run** o presiona `Ctrl + Enter`
   - Espera a que termine (puede tardar unos segundos)

4. **Verifica:**
   - Deberías ver mensajes como: "Código PAC-00001 asignado al usuario..."
   - Ejecuta la consulta de verificación al final del script

---

## ✅ ¿Qué hace el script?

1. **Agrega la columna `codigo_usuario`** a la tabla `usuarios`
2. **Crea secuencias** para generar números únicos por tipo de usuario
3. **Crea una función** que genera el código automáticamente
4. **Crea un trigger** que se ejecuta al insertar un nuevo usuario
5. **Genera códigos** para usuarios existentes (si los hay)

---

## 🔍 Verificar que Funciona

### Ver todos los códigos generados:

```sql
SELECT 
    codigo_usuario,
    email,
    nombre_completo,
    rol,
    creado_en
FROM usuarios
ORDER BY creado_en DESC;
```

### Ver solo pacientes con sus códigos:

```sql
SELECT 
    codigo_usuario,
    email,
    nombre_completo
FROM usuarios
WHERE rol = 'paciente'
ORDER BY codigo_usuario;
```

### Ver solo doctores con sus códigos:

```sql
SELECT 
    codigo_usuario,
    email,
    nombre_completo
FROM usuarios
WHERE rol = 'doctor'
ORDER BY codigo_usuario;
```

---

## 📱 Dónde se Muestra el ID

### En el Dashboard del Paciente:
- Sección "Mi Perfil" en el sidebar
- Muestra: **ID de Paciente: PAC-00001**
- Color destacado en azul primario

### En la Página de Edición de Perfil:
- Primer campo en "Información Personal"
- Campo deshabilitado (no editable)
- Texto de ayuda: "ID único asignado automáticamente"

---

## 🔄 Comportamiento

### Al Registrarse:
1. Usuario completa el formulario de registro
2. Se crea el usuario en Supabase Auth
3. Se crea el registro en la tabla `usuarios`
4. **El trigger genera automáticamente el código** (ej: PAC-00001)
5. El usuario puede ver su ID inmediatamente en su perfil

### Al Cambiar de Rol:
- Si un paciente se convierte en doctor, **el código NO cambia**
- Ejemplo: Un usuario con `PAC-00001` que se convierte en doctor, mantiene `PAC-00001`
- Esto es intencional para mantener la trazabilidad

---

## 🛠️ Personalización

### Cambiar el Formato del Código:

Si quieres cambiar el formato (ej: usar 6 dígitos en lugar de 5):

```sql
-- Editar la función generar_codigo_usuario
-- Cambiar esta línea:
v_numero := LPAD(nextval('seq_paciente_id')::TEXT, 5, '0');

-- Por esta (para 6 dígitos):
v_numero := LPAD(nextval('seq_paciente_id')::TEXT, 6, '0');
```

### Cambiar los Prefijos:

```sql
-- En la función generar_codigo_usuario
WHEN 'paciente' THEN 
    v_prefijo := 'PAC';  -- Cambiar por 'PACIENTE' o lo que quieras
```

---

## ⚠️ Notas Importantes

1. **Único por usuario**: Cada código es único y no se puede duplicar
2. **Inmutable**: Una vez asignado, el código no se puede cambiar
3. **Automático**: Se genera sin intervención manual
4. **Secuencial**: Los números son consecutivos (00001, 00002, 00003...)
5. **Por tipo**: Cada tipo de usuario tiene su propia secuencia

---

## 🆘 Solución de Problemas

### Error: "column codigo_usuario does not exist"
- **Causa**: El script no se ejecutó correctamente
- **Solución**: Ejecuta el script completo nuevamente

### El código no aparece en el perfil
- **Causa**: El usuario se registró antes de ejecutar el script
- **Solución**: Ejecuta la sección #5 del script para generar códigos retroactivos

### Los códigos no son consecutivos
- **Causa**: Normal si hubo errores o pruebas
- **Solución**: Las secuencias continúan desde el último número usado

### Quiero reiniciar la numeración
```sql
-- CUIDADO: Esto reinicia los contadores
ALTER SEQUENCE seq_paciente_id RESTART WITH 1;
ALTER SEQUENCE seq_doctor_id RESTART WITH 1;
ALTER SEQUENCE seq_admin_id RESTART WITH 1;
```

---

## 📊 Ejemplo Completo

```sql
-- 1. Usuario se registra como paciente
-- Email: juan@ejemplo.com
-- Nombre: Juan Pérez

-- 2. El sistema automáticamente:
INSERT INTO usuarios (email, nombre_completo, rol)
VALUES ('juan@ejemplo.com', 'Juan Pérez', 'paciente');
-- Trigger genera: codigo_usuario = 'PAC-00001'

-- 3. Verificar:
SELECT codigo_usuario, email, nombre_completo 
FROM usuarios 
WHERE email = 'juan@ejemplo.com';

-- Resultado:
-- codigo_usuario | email              | nombre_completo
-- PAC-00001      | juan@ejemplo.com   | Juan Pérez
```

---

## 📁 Archivos Relacionados

- **Script SQL**: `supabase/agregar_codigo_usuario.sql`
- **Dashboard Paciente**: `app/dashboard/paciente/page.tsx`
- **Perfil Paciente**: `app/dashboard/paciente/perfil/page.tsx`

¡El sistema de IDs automáticos está listo! 🎉
