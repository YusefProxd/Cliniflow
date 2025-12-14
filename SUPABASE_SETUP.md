# 🔧 Guía de Configuración de Supabase para CliniFlow

Esta guía te llevará paso a paso para configurar Supabase como backend de CliniFlow.

## 📋 Prerrequisitos

- Una cuenta de correo electrónico
- Navegador web moderno
- Acceso a internet

## 🚀 Paso 1: Crear Cuenta en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"** o **"Sign Up"**
3. Puedes registrarte con:
   - GitHub (recomendado)
   - Google
   - Email y contraseña

## 🏗️ Paso 2: Crear un Nuevo Proyecto

1. Una vez iniciada sesión, haz clic en **"New Project"**
2. Completa la información del proyecto:
   - **Name**: `CliniFlow` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡guárdala!)
   - **Region**: Selecciona la región más cercana a tus usuarios
   - **Pricing Plan**: Selecciona "Free" para empezar

3. Haz clic en **"Create new project"**
4. Espera 1-2 minutos mientras Supabase configura tu proyecto

## 🗄️ Paso 3: Configurar la Base de Datos

### 3.1 Acceder al SQL Editor

1. En el panel lateral izquierdo, haz clic en el ícono **"SQL Editor"** (📝)
2. Haz clic en **"New query"**

### 3.2 Ejecutar el Esquema de Base de Datos

1. Abre el archivo `supabase/schema.sql` de tu proyecto CliniFlow
2. Copia **todo** el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Haz clic en **"Run"** (▶️) en la esquina inferior derecha
5. Deberías ver un mensaje de éxito: ✅ **"Success. No rows returned"**

### 3.3 Verificar las Tablas Creadas

1. En el panel lateral, haz clic en **"Table Editor"** (📊)
2. Deberías ver las siguientes tablas:
   - ✅ users
   - ✅ doctors
   - ✅ patients
   - ✅ appointments
   - ✅ medical_records
   - ✅ prescriptions
   - ✅ lab_results
   - ✅ services

## 🔐 Paso 4: Configurar la Autenticación

### 4.1 Habilitar Proveedores de Autenticación

1. En el panel lateral, haz clic en **"Authentication"** (🔐)
2. Ve a la pestaña **"Providers"**
3. Asegúrate de que **"Email"** esté habilitado (debería estarlo por defecto)

### 4.2 (Opcional) Configurar Google OAuth

Si deseas permitir login con Google:

1. En la sección de Providers, busca **"Google"**
2. Haz clic en **"Enable"**
3. Necesitarás:
   - Client ID de Google Cloud Console
   - Client Secret de Google Cloud Console
4. Sigue las instrucciones de Supabase para obtener estas credenciales

### 4.3 Configurar URLs de Redirección

1. Ve a **"Authentication"** → **"URL Configuration"**
2. Agrega las siguientes URLs:
   - **Site URL**: `http://localhost:3000` (desarrollo)
   - **Redirect URLs**: 
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3001/auth/callback`

## 🔑 Paso 5: Obtener las Credenciales

### 5.1 Encontrar tus Credenciales

1. En el panel lateral, haz clic en **"Settings"** (⚙️)
2. Ve a **"API"**
3. Encontrarás dos valores importantes:

#### Project URL
```
https://tuproyecto.supabase.co
```

#### Anon/Public Key (anon key)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

⚠️ **IMPORTANTE**: 
- La **anon key** es segura para usar en el cliente
- **NUNCA** compartas la **service_role key** en el código del cliente

### 5.2 Configurar Variables de Entorno

1. En la raíz de tu proyecto CliniFlow, crea un archivo `.env.local`
2. Agrega las siguientes líneas:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

3. Reemplaza los valores con tus credenciales reales
4. **NUNCA** subas este archivo a Git (ya está en `.gitignore`)

## 📊 Paso 6: Verificar Row Level Security (RLS)

### 6.1 Comprobar Políticas de Seguridad

1. Ve a **"Authentication"** → **"Policies"**
2. Deberías ver políticas creadas para cada tabla
3. Estas políticas aseguran que:
   - Los pacientes solo vean sus propios datos
   - Los doctores solo vean datos de sus pacientes
   - Los administradores tengan acceso completo

### 6.2 Probar las Políticas

El esquema SQL ya incluye todas las políticas necesarias. Si quieres verificarlas:

1. Ve a **"Table Editor"**
2. Selecciona cualquier tabla (ej: `usuarios`)
3. Haz clic en el ícono de escudo (🛡️) para ver las políticas RLS

## 🧪 Paso 7: Datos de Prueba (Opcional)

### 7.1 Insertar Servicios de Ejemplo

El esquema SQL ya incluye servicios de ejemplo. Para verificar:

1. Ve a **"Table Editor"**
2. Selecciona la tabla **"services"**
3. Deberías ver 9 servicios médicos precargados

### 7.2 Crear Usuario de Prueba

Puedes crear usuarios de prueba desde:

1. **Opción A - Desde la Aplicación**:
   - Usa el formulario de registro de CliniFlow
   - Se creará automáticamente en Supabase

2. **Opción B - Desde Supabase**:
   - Ve a **"Authentication"** → **"Users"**
   - Haz clic en **"Add user"**
   - Completa email y contraseña
   - Haz clic en **"Create user"**

## 🔍 Paso 8: Monitoreo y Logs

### 8.1 Ver Logs de Autenticación

1. Ve a **"Authentication"** → **"Logs"**
2. Aquí verás todos los intentos de login, registro, etc.

### 8.2 Ver Logs de Base de Datos

1. Ve a **"Database"** → **"Logs"**
2. Aquí verás todas las queries ejecutadas

### 8.3 Monitorear Uso

1. Ve a **"Settings"** → **"Usage"**
2. Verás:
   - Número de usuarios activos
   - Almacenamiento usado
   - Ancho de banda
   - Requests de API

## ✅ Paso 9: Verificar la Instalación

### 9.1 Checklist de Verificación

- [ ] Proyecto de Supabase creado
- [ ] Esquema SQL ejecutado correctamente
- [ ] 8 tablas visibles en Table Editor
- [ ] Autenticación por email habilitada
- [ ] Credenciales copiadas a `.env.local`
- [ ] Servicios de ejemplo cargados
- [ ] RLS habilitado en todas las tablas

### 9.2 Probar la Conexión

1. Asegúrate de que el servidor de desarrollo esté corriendo:
   ```bash
   npm run dev
   ```

2. Abre tu navegador en `http://localhost:3000`
3. Intenta registrarte con un email de prueba
4. Si todo funciona, ¡la configuración está completa! 🎉

## 🆘 Solución de Problemas

### Error: "Invalid API key"
- Verifica que copiaste correctamente la `anon key`
- Asegúrate de que no haya espacios extra
- Reinicia el servidor de desarrollo

### Error: "Failed to fetch"
- Verifica que la `NEXT_PUBLIC_SUPABASE_URL` sea correcta
- Comprueba tu conexión a internet
- Verifica que el proyecto de Supabase esté activo

### Error: "Row Level Security"
- Asegúrate de haber ejecutado todo el esquema SQL
- Verifica que RLS esté habilitado en las tablas
- Comprueba que las políticas se hayan creado correctamente

### Las tablas no aparecen
- Revisa el SQL Editor para ver si hubo errores
- Ejecuta el esquema SQL nuevamente
- Verifica que tengas permisos de administrador

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers para Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Comunidad de Supabase](https://github.com/supabase/supabase/discussions)

## 🎓 Próximos Pasos

Una vez completada la configuración de Supabase:

1. ✅ Continúa con el desarrollo de las páginas de autenticación
2. ✅ Implementa los dashboards por rol
3. ✅ Desarrolla el sistema de agendamiento
4. ✅ Agrega funcionalidades avanzadas

---

**¡Felicidades!** 🎉 Has configurado exitosamente Supabase para CliniFlow.

Si tienes algún problema, revisa la sección de **Solución de Problemas** o consulta la documentación oficial de Supabase.
