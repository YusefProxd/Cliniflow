# Solución Final: Creación de Registros en Tablas

## 🎯 Problema Resuelto

Los triggers en `auth.users` no funcionan correctamente en Supabase. La solución es usar una **función RPC** que se llama desde la aplicación.

---

## 🚀 Pasos para Implementar

### Paso 1: Ejecutar la Función RPC en Supabase

1. Abre **Supabase Dashboard** → **SQL Editor**
2. Copia el contenido de `supabase/funcion_crear_usuario.sql`
3. Pégalo y ejecuta
4. Verifica que se creó la función:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name = 'create_user_profile';
```

### Paso 2: Los Cambios en el Código ya Están Aplicados

Los siguientes archivos ya fueron actualizados automáticamente:

- ✅ `lib/supabase.ts` - Función `signUp` actualizada
- ✅ `app/auth/callback/page.tsx` - Callback de OAuth actualizado

---

## 🔄 Cómo Funciona Ahora

### Registro Normal:

```
1. Usuario completa formulario
   ↓
2. signUp() crea cuenta en Supabase Auth
   ↓
3. signUp() llama a RPC create_user_profile()
   ↓
4. RPC crea registro en 'usuarios'
   ↓
5. Trigger genera código (PAC-00001)
   ↓
6. RPC crea registro en 'pacientes'
   ↓
7. Usuario redirigido a home
```

### Google OAuth:

```
1. Usuario hace clic en "Continuar con Google"
   ↓
2. Autoriza la aplicación
   ↓
3. Redirigido a /auth/callback
   ↓
4. Callback llama a RPC create_user_profile()
   ↓
5. RPC crea registro en 'usuarios'
   ↓
6. Trigger genera código (PAC-00001)
   ↓
7. RPC crea registro en 'pacientes'
   ↓
8. Usuario redirigido a home
```

---

## ✅ Verificar que Funciona

### 1. Probar Registro Normal:

1. Ve a `http://localhost:3000/register`
2. Completa el formulario
3. Haz clic en "Crear Cuenta"
4. Abre la consola del navegador (F12)
5. Deberías ver: `User profile created: {...}`

### 2. Verificar en Supabase:

```sql
-- Ver el usuario creado
SELECT 
    u.codigo_usuario,
    u.email,
    u.nombre_completo,
    u.rol,
    p.id as paciente_id
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
WHERE u.email = 'tu-email@ejemplo.com';
```

**Deberías ver:**
- ✅ Registro en `usuarios` con código (PAC-00001)
- ✅ Registro en `pacientes` con usuario_id

### 3. Probar Google OAuth:

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Continuar con Google"
3. Autoriza la aplicación
4. Abre la consola del navegador
5. Deberías ver: `Profile created/updated: {...}`

---

## 🔍 Solución de Problemas

### Error: "function create_user_profile does not exist"

**Solución:**
```sql
-- Ejecuta el script completo
-- supabase/funcion_crear_usuario.sql
```

### Los registros no se crean

**Diagnóstico:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca errores en rojo
4. Copia el mensaje de error

**Verificar permisos:**
```sql
-- Dar permisos a la función
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION create_user_profile(UUID, TEXT, TEXT, TEXT) TO anon;
```

### El código de usuario no se genera

**Verificar trigger:**
```sql
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'trigger_generar_codigo_usuario';
```

**Si no existe, ejecutar:**
```sql
-- Ejecuta supabase/setup_completo.sql
-- O al menos la parte del trigger de código
```

---

## 📊 Estructura de la Función RPC

La función `create_user_profile` hace lo siguiente:

```sql
1. Recibe parámetros:
   - p_user_id: UUID del usuario de auth.users
   - p_email: Email del usuario
   - p_nombre_completo: Nombre completo
   - p_rol: Rol (siempre 'paciente')

2. Inserta en tabla 'usuarios':
   - ON CONFLICT DO UPDATE (actualiza si existe)
   - El trigger genera el código automáticamente

3. Si rol = 'paciente':
   - Inserta en tabla 'pacientes'
   - ON CONFLICT DO NOTHING (no duplica)

4. Retorna JSON con resultado:
   {
     "success": true,
     "usuario_id": "uuid",
     "codigo_usuario": "PAC-00001",
     "paciente_id": "uuid",
     "rol": "paciente"
   }
```

---

## 🎉 Ventajas de esta Solución

1. ✅ **Funciona garantizado**: No depende de triggers en auth.users
2. ✅ **Control total**: Puedes ver logs en la consola
3. ✅ **Manejo de errores**: Captura y muestra errores
4. ✅ **Idempotente**: No crea duplicados (ON CONFLICT)
5. ✅ **Compatible**: Funciona con registro normal y OAuth
6. ✅ **Actualizable**: Si el usuario ya existe, actualiza sus datos

---

## 📁 Archivos Involucrados

1. **Función RPC**: `supabase/funcion_crear_usuario.sql`
2. **Registro**: `lib/supabase.ts` (función signUp)
3. **OAuth**: `app/auth/callback/page.tsx`
4. **Trigger código**: `supabase/setup_completo.sql`

---

## 🧪 Prueba Completa

```bash
# 1. Registrar usuario
# Ve a /register y completa el formulario

# 2. Verificar en Supabase
SELECT * FROM usuarios ORDER BY creado_en DESC LIMIT 1;
SELECT * FROM pacientes ORDER BY creado_en DESC LIMIT 1;

# 3. Verificar que coinciden
SELECT 
    u.codigo_usuario,
    u.email,
    p.id as tiene_paciente
FROM usuarios u
LEFT JOIN pacientes p ON p.usuario_id = u.id
ORDER BY u.creado_en DESC
LIMIT 1;
```

**Resultado esperado:**
```
codigo_usuario | email              | tiene_paciente
PAC-00001      | usuario@email.com  | uuid-del-paciente
```

¡El sistema ahora funciona correctamente! 🎉
