# 🔐 Configuración de Google OAuth 2.0 para CliniFlow

Esta guía te ayudará a configurar el inicio de sesión con Google en CliniFlow.

---

## 📋 Paso 1: Crear Proyecto en Google Cloud Console

### 1.1 Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google
3. Acepta los términos de servicio si es tu primera vez

### 1.2 Crear un Nuevo Proyecto

1. Haz clic en el selector de proyectos (arriba a la izquierda)
2. Haz clic en **"Nuevo Proyecto"**
3. Completa la información:
   - **Nombre del proyecto**: `CliniFlow` (o el nombre que prefieras)
   - **Organización**: Dejar en blanco si no tienes
4. Haz clic en **"Crear"**
5. Espera unos segundos mientras se crea el proyecto
6. Selecciona el proyecto recién creado

---

## 🔑 Paso 2: Configurar Pantalla de Consentimiento OAuth

### 2.1 Acceder a la Configuración

1. En el menú lateral, ve a **"APIs y servicios"** → **"Pantalla de consentimiento de OAuth"**
2. Selecciona **"Externo"** (para permitir que cualquier usuario con cuenta de Google pueda acceder)
3. Haz clic en **"Crear"**

### 2.2 Configurar la Información de la Aplicación

**Paso 1: Información de la aplicación**

- **Nombre de la aplicación**: `CliniFlow`
- **Correo electrónico de asistencia al usuario**: Tu correo electrónico
- **Logo de la aplicación**: (Opcional) Puedes subir el logo de CliniFlow
- **Dominios de la aplicación**:
  - Dominio de la aplicación: `localhost` (para desarrollo)
  - Página principal de la aplicación: `http://localhost:3000`
  - Política de privacidad: `http://localhost:3000/privacy`
  - Condiciones del servicio: `http://localhost:3000/terms`
- **Dominios autorizados**: (Dejar vacío por ahora)
- **Información de contacto del desarrollador**: Tu correo electrónico

Haz clic en **"Guardar y continuar"**

**Paso 2: Permisos**

- No necesitas agregar permisos adicionales para OAuth básico
- Haz clic en **"Guardar y continuar"**

**Paso 3: Usuarios de prueba** (Opcional)

- Puedes agregar correos electrónicos de usuarios de prueba si quieres
- Haz clic en **"Guardar y continuar"**

**Paso 4: Resumen**

- Revisa la información
- Haz clic en **"Volver al panel"**

---

## 🔐 Paso 3: Crear Credenciales OAuth 2.0

### 3.1 Crear ID de Cliente OAuth

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"+ Crear credenciales"**
3. Selecciona **"ID de cliente de OAuth"**

### 3.2 Configurar el ID de Cliente

1. **Tipo de aplicación**: Selecciona **"Aplicación web"**

2. **Nombre**: `CliniFlow Web Client`

3. **Orígenes de JavaScript autorizados**:
   ```
   http://localhost:3000
   http://localhost:3001
   https://zivbekmukkkubthcfawz.supabase.co
   ```

4. **URIs de redirección autorizados**:
   ```
   https://zivbekmukkkubthcfawz.supabase.co/auth/v1/callback
   http://localhost:3000/auth/callback
   ```

5. Haz clic en **"Crear"**

### 3.3 Guardar las Credenciales

Aparecerá un modal con tus credenciales:

- **ID de cliente**: `algo-como-esto.apps.googleusercontent.com`
- **Secreto del cliente**: `GOCSPX-algo-como-esto`

⚠️ **IMPORTANTE**: Copia estas credenciales, las necesitarás en el siguiente paso.

---

## 🔗 Paso 4: Configurar Google OAuth en Supabase

### 4.1 Acceder a la Configuración de Autenticación

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto: `zivbekmukkkubthcfawz`
3. Ve a **"Authentication"** → **"Providers"**

### 4.2 Habilitar Google Provider

1. Busca **"Google"** en la lista de proveedores
2. Activa el toggle para **"Enable Sign in with Google"**

### 4.3 Configurar las Credenciales

Completa los siguientes campos:

- **Client ID (for OAuth)**: Pega el ID de cliente de Google
  ```
  TU-CLIENT-ID.apps.googleusercontent.com
  ```

- **Client Secret (for OAuth)**: Pega el secreto del cliente
  ```
  GOCSPX-TU-CLIENT-SECRET
  ```

- **Authorized Client IDs**: (Dejar vacío)

### 4.4 Guardar la Configuración

1. Haz clic en **"Save"**
2. Verás un mensaje de confirmación

---

## 🌐 Paso 5: Configurar URLs de Redirección en Supabase

### 5.1 Configurar Site URL

1. En Supabase, ve a **"Authentication"** → **"URL Configuration"**
2. Configura los siguientes valores:

**Site URL**:
```
http://localhost:3000
```

**Redirect URLs** (agregar estas URLs):
```
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3000/auth/callback
```

3. Haz clic en **"Save"**

---

## 📝 Paso 6: Actualizar Variables de Entorno (Ya configurado)

El archivo `.env.local` ya tiene las credenciales de Supabase necesarias:

```env
NEXT_PUBLIC_SUPABASE_URL=https://zivbekmukkkubthcfawz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

No necesitas agregar nada más, Supabase maneja Google OAuth automáticamente.

---

## ✅ Paso 7: Probar la Autenticación con Google

### 7.1 Iniciar el Servidor

El servidor ya está corriendo en `http://localhost:3000`

### 7.2 Probar el Login

1. Ve a `http://localhost:3000/login`
2. Haz clic en el botón **"Continuar con Google"**
3. Serás redirigido a la pantalla de Google
4. Selecciona tu cuenta de Google
5. Autoriza el acceso a CliniFlow
6. Serás redirigido de vuelta a la aplicación

### 7.3 Verificar en Supabase

1. Ve a **"Authentication"** → **"Users"** en Supabase
2. Deberías ver el usuario creado con el proveedor "google"

---

## 🔧 Resumen de URLs Importantes

### Para Google Cloud Console:

**Orígenes de JavaScript autorizados**:
```
http://localhost:3000
http://localhost:3001
https://zivbekmukkkubthcfawz.supabase.co
```

**URIs de redirección autorizados**:
```
https://zivbekmukkkubthcfawz.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback
```

### Para Supabase:

**Site URL**:
```
http://localhost:3000
```

**Redirect URLs**:
```
http://localhost:3000/**
http://localhost:3001/**
http://localhost:3000/auth/callback
```

---

## 🚀 Paso 8: Configuración para Producción (Futuro)

Cuando despliegues a producción, deberás:

### En Google Cloud Console:

Agregar a **Orígenes de JavaScript autorizados**:
```
https://tu-dominio.com
```

Agregar a **URIs de redirección autorizados**:
```
https://zivbekmukkkubthcfawz.supabase.co/auth/v1/callback
https://tu-dominio.com/auth/callback
```

### En Supabase:

Actualizar **Site URL**:
```
https://tu-dominio.com
```

Agregar a **Redirect URLs**:
```
https://tu-dominio.com/**
https://tu-dominio.com/auth/callback
```

---

## 🐛 Solución de Problemas

### Error: "redirect_uri_mismatch"

- Verifica que las URIs de redirección en Google Cloud Console coincidan exactamente
- Asegúrate de incluir `https://` o `http://` según corresponda
- No debe haber espacios ni caracteres extra

### Error: "Access blocked: This app's request is invalid"

- Verifica que la pantalla de consentimiento OAuth esté configurada
- Asegúrate de haber agregado tu correo como usuario de prueba (si está en modo desarrollo)

### El botón de Google no funciona

- Verifica que las credenciales en Supabase sean correctas
- Revisa la consola del navegador para ver errores
- Asegúrate de que el servidor esté corriendo

### Usuario no se crea en la base de datos

- Verifica que el esquema SQL esté ejecutado en Supabase
- Revisa que las políticas RLS estén configuradas correctamente

---

## 📚 Recursos Adicionales

- [Documentación de Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)
- [OAuth 2.0 de Google](https://developers.google.com/identity/protocols/oauth2)

---

**¡Listo!** 🎉 Ahora tus usuarios pueden iniciar sesión con Google en CliniFlow.
