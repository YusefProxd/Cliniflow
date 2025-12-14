# Guía: Creación Automática de Pacientes al Registrarse

## 📋 Resumen

Ahora, cuando un usuario se registra en la plataforma, **automáticamente se crea su registro en la tabla `pacientes`**. Esto significa que:

- ✅ No necesitas crear manualmente el registro de paciente
- ✅ El usuario puede acceder inmediatamente a su dashboard
- ✅ Puede editar su perfil desde el primer momento
- ✅ Funciona tanto para registro normal como para Google OAuth

---

## 🚀 Instalación (Solo una vez)

### Paso 1: Ejecutar el Script SQL

1. **Abre Supabase Dashboard**
   - Ve a tu proyecto en [supabase.com](https://supabase.com)
   - Navega a **SQL Editor**

2. **Copia y pega el script completo:**
   - Abre el archivo `supabase/crear_paciente_automatico.sql`
   - Copia TODO el contenido
   - Pégalo en el SQL Editor de Supabase

3. **Ejecuta el script:**
   - Haz clic en **Run** o presiona `Ctrl + Enter`
   - Espera a que termine (puede tardar unos segundos)

4. **Verifica:**
   - Deberías ver mensajes como: "Registro de paciente creado para usuario..."
   - Ejecuta la consulta de verificación al final del script

---

## ✅ ¿Qué hace el script?

### 1. **Crea la función `handle_new_user()`**
   - Se ejecuta automáticamente cuando se crea un usuario
   - Inserta el usuario en la tabla `usuarios`
   - Si el rol es 'paciente', crea el registro en `pacientes`

### 2. **Crea el trigger `on_auth_user_created`**
   - Se activa cuando se inserta un nuevo usuario en `auth.users`
   - Llama a la función `handle_new_user()`

### 3. **Crea la función `handle_google_oauth_user()`**
   - Maneja específicamente usuarios de Google OAuth
   - Extrae el nombre completo de los metadatos de Google
   - Crea el usuario y el paciente automáticamente

### 4. **Crea el trigger `on_google_oauth_user_created`**
   - Se activa solo para usuarios de Google
   - Asegura que los usuarios de OAuth también tengan su registro

### 5. **Migra usuarios existentes**
   - Crea registros de pacientes para usuarios que no los tienen
   - Solo afecta a usuarios con rol 'paciente'

---

## 🔄 Flujo de Registro

### Registro Normal:

```
1. Usuario completa formulario
   ↓
2. Se crea cuenta en Supabase Auth (auth.users)
   ↓
3. TRIGGER se activa automáticamente
   ↓
4. Se crea registro en tabla 'usuarios'
   ↓
5. Se genera código de usuario (PAC-00001)
   ↓
6. Se crea registro en tabla 'pacientes'
   ↓
7. Usuario puede acceder a su dashboard
```

### Registro con Google OAuth:

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. Autoriza la aplicación
   ↓
3. Se crea cuenta en Supabase Auth
   ↓
4. TRIGGER de Google se activa
   ↓
5. Se extrae nombre de metadatos de Google
   ↓
6. Se crea registro en 'usuarios' (rol: paciente)
   ↓
7. Se genera código de usuario (PAC-00001)
   ↓
8. Se crea registro en 'pacientes'
   ↓
9. Usuario redirigido a dashboard
```

---

## 🔍 Verificar que Funciona

### Ver todos los pacientes con sus registros:

```sql
SELECT 
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
```

### Ver triggers activos:

```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name LIKE '%user%'
ORDER BY trigger_name;
```

### Verificar un usuario específico:

```sql
SELECT 
    u.codigo_usuario,
    u.email,
    u.nombre_completo,
    p.id as paciente_id,
    p.tipo_sangre,
    p.alergias
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
WHERE u.email = 'usuario@ejemplo.com';
```

---

## 🧪 Probar el Sistema

### Prueba 1: Registro Normal

1. Ve a `/register`
2. Completa el formulario:
   - Nombre: Juan Pérez
   - Email: juan@test.com
   - Contraseña: test123
3. Haz clic en "Crear Cuenta"
4. Verifica en Supabase:

```sql
-- Debe mostrar el usuario y su registro de paciente
SELECT u.*, p.* 
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
WHERE u.email = 'juan@test.com';
```

### Prueba 2: Google OAuth

1. Ve a `/login` o `/register`
2. Haz clic en "Continuar con Google"
3. Autoriza la aplicación
4. Verifica en Supabase:

```sql
-- Debe mostrar el usuario con nombre de Google y registro de paciente
SELECT u.*, p.* 
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
WHERE u.email = 'tu-email-google@gmail.com';
```

---

## 📊 Estructura de Datos Creada

Cuando un usuario se registra, se crean automáticamente:

### Tabla `auth.users`:
```
id: uuid (generado por Supabase)
email: usuario@ejemplo.com
raw_user_meta_data: {
  nombre_completo: "Juan Pérez",
  rol: "paciente"
}
```

### Tabla `usuarios`:
```
id: uuid (mismo que auth.users)
email: usuario@ejemplo.com
nombre_completo: Juan Pérez
rol: paciente
codigo_usuario: PAC-00001 (generado automáticamente)
creado_en: 2024-12-13 01:00:00
```

### Tabla `pacientes`:
```
id: uuid (generado automáticamente)
usuario_id: uuid (referencia a usuarios.id)
fecha_nacimiento: null (se llena después)
tipo_sangre: null (se llena después)
alergias: null (se llena después)
contacto_emergencia: null (se llena después)
telefono_emergencia: null (se llena después)
creado_en: 2024-12-13 01:00:00
```

---

## ⚠️ Notas Importantes

1. **Automático**: No necesitas código adicional en la aplicación
2. **Inmediato**: El registro se crea en milisegundos
3. **Seguro**: Usa `SECURITY DEFINER` para permisos adecuados
4. **Idempotente**: No crea duplicados si el usuario ya existe
5. **Compatible**: Funciona con registro normal y Google OAuth

---

## 🛠️ Solución de Problemas

### Error: "Usuario creado pero no tiene registro de paciente"

**Causa**: El trigger no se ejecutó correctamente

**Solución**:
```sql
-- Crear manualmente el registro de paciente
INSERT INTO pacientes (usuario_id)
SELECT id FROM usuarios 
WHERE email = 'usuario@ejemplo.com'
AND NOT EXISTS (
    SELECT 1 FROM pacientes WHERE usuario_id = usuarios.id
);
```

### Error: "duplicate key value violates unique constraint"

**Causa**: Ya existe un registro de paciente para ese usuario

**Solución**: No hacer nada, el usuario ya está configurado correctamente

### Los triggers no aparecen

**Causa**: El script no se ejecutó correctamente

**Solución**: Ejecuta el script completo nuevamente desde el SQL Editor

---

## 🔧 Mantenimiento

### Deshabilitar temporalmente los triggers:

```sql
-- Deshabilitar
ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_created;
ALTER TABLE auth.users DISABLE TRIGGER on_google_oauth_user_created;

-- Habilitar nuevamente
ALTER TABLE auth.users ENABLE TRIGGER on_auth_user_created;
ALTER TABLE auth.users ENABLE TRIGGER on_google_oauth_user_created;
```

### Eliminar los triggers (si es necesario):

```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_google_oauth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();
DROP FUNCTION IF EXISTS handle_google_oauth_user();
```

---

## 📁 Archivos Relacionados

- **Script SQL**: `supabase/crear_paciente_automatico.sql`
- **Función de registro**: `lib/supabase.ts` (función `signUp`)
- **Esquema de BD**: `supabase/schema.sql`

---

## ✨ Beneficios

1. **Experiencia de usuario mejorada**: El usuario puede usar la app inmediatamente
2. **Menos errores**: No hay posibilidad de olvidar crear el registro
3. **Código más limpio**: No necesitas lógica adicional en la app
4. **Consistencia**: Todos los pacientes tienen su registro garantizado
5. **Escalable**: Funciona sin importar cuántos usuarios se registren

¡El sistema de creación automática de pacientes está listo! 🎉
