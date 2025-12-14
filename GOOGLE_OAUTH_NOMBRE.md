# Solución: Google OAuth - Nombre Completo

## 🔧 Problema Resuelto

Google OAuth ahora extrae correctamente el nombre completo del usuario en lugar de usar solo el email.

---

## ✅ Cambios Realizados

### Archivo: `app/auth/callback/page.tsx`

**Antes:**
```typescript
const nombreCompleto = user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Usuario';
```

**Ahora:**
```typescript
const nombreCompleto = 
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.user_metadata?.given_name && user.user_metadata?.family_name 
        ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
        : null) ||
    user.user_metadata?.given_name ||
    user.user_metadata?.email?.split('@')[0] ||
    user.email?.split('@')[0] ||
    'Usuario';
```

---

## 🔍 Campos que Revisa (en orden):

1. **`full_name`** - Nombre completo (si Google lo proporciona)
2. **`name`** - Nombre (campo alternativo)
3. **`given_name + family_name`** - Nombre + Apellido (combinados)
4. **`given_name`** - Solo el nombre (si no hay apellido)
5. **`email`** - Parte antes del @ del email (último recurso)
6. **`'Usuario'`** - Valor por defecto

---

## 🧪 Cómo Verificar

### Paso 1: Probar Google OAuth

1. Ve a `http://localhost:3000/login`
2. Haz clic en "Continuar con Google"
3. Autoriza la aplicación
4. **Abre la consola del navegador (F12)**

### Paso 2: Ver los Logs

En la consola deberías ver:

```javascript
User metadata: {
  iss: "https://accounts.google.com",
  sub: "...",
  name: "Juan Pérez",           // ← Nombre completo
  given_name: "Juan",            // ← Nombre
  family_name: "Pérez",          // ← Apellido
  picture: "https://...",
  email: "juan@gmail.com",
  email_verified: true
}

Nombre extraído: Juan Pérez     // ← Esto es lo que se guarda
```

### Paso 3: Verificar en Supabase

```sql
SELECT 
    codigo_usuario,
    email,
    nombre_completo
FROM usuarios
WHERE email = 'tu-email-google@gmail.com';
```

**Deberías ver:**
```
codigo_usuario | email                    | nombre_completo
PAC-00001      | juan@gmail.com           | Juan Pérez
```

---

## 📊 Casos de Uso

### Caso 1: Google proporciona nombre completo
```javascript
user_metadata: { name: "María García" }
→ Resultado: "María García"
```

### Caso 2: Google proporciona nombre y apellido separados
```javascript
user_metadata: { 
  given_name: "Carlos",
  family_name: "López"
}
→ Resultado: "Carlos López"
```

### Caso 3: Solo nombre
```javascript
user_metadata: { given_name: "Ana" }
→ Resultado: "Ana"
```

### Caso 4: Sin nombre (raro, pero posible)
```javascript
user_metadata: { email: "usuario@gmail.com" }
→ Resultado: "usuario"
```

---

## 🔧 Si el Nombre Sigue Sin Aparecer

### Opción 1: Ver qué trae Google

1. Inicia sesión con Google
2. Abre la consola (F12)
3. Busca el log: `User metadata: {...}`
4. Copia todo el objeto
5. Comparte para diagnóstico

### Opción 2: Actualizar Manualmente

Si ya te registraste y el nombre está mal:

```sql
-- Actualizar el nombre de un usuario
UPDATE usuarios 
SET nombre_completo = 'Tu Nombre Completo'
WHERE email = 'tu-email@gmail.com';
```

### Opción 3: Verificar Permisos de Google

En la configuración de Google OAuth en Supabase:
1. Ve a **Authentication** → **Providers** → **Google**
2. Asegúrate de que los scopes incluyan:
   - `email`
   - `profile`

---

## 🎯 Resultado Esperado

Ahora cuando te registres con Google:

1. ✅ Se extrae tu nombre completo de Google
2. ✅ Se guarda en la tabla `usuarios`
3. ✅ Aparece en tu perfil
4. ✅ Se muestra en el dashboard

**Ejemplo:**
- Email: `juan.perez@gmail.com`
- Nombre en Google: `Juan Pérez`
- Nombre guardado: `Juan Pérez` ✅ (no `juan.perez`)

---

## 📁 Archivo Modificado

- `app/auth/callback/page.tsx` - Lógica mejorada de extracción de nombre

¡El nombre completo ahora se captura correctamente de Google OAuth! 🎉
