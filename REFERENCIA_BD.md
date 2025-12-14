# 📖 Referencia de Base de Datos - CliniFlow

## 🗂️ Traducción de Tablas y Campos

### Tablas (Inglés → Español)

| Inglés | Español |
|--------|---------|
| users | usuarios |
| doctors | doctores |
| patients | pacientes |
| appointments | citas |
| medical_records | historiales_medicos |
| prescriptions | recetas |
| lab_results | resultados_laboratorio |
| services | servicios |

---

## 📋 Campos por Tabla

### 👤 **usuarios** (users)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| email | TEXT | Correo electrónico |
| nombre_completo | TEXT | Nombre completo del usuario |
| rol | TEXT | Rol: 'paciente', 'doctor', 'admin' |
| url_avatar | TEXT | URL de la foto de perfil |
| telefono | TEXT | Número de teléfono |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 👨‍⚕️ **doctores** (doctors)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| usuario_id | UUID | Referencia a usuarios |
| especialidad | TEXT | Especialidad médica |
| numero_licencia | TEXT | Número de licencia médica |
| anos_experiencia | INTEGER | Años de experiencia |
| educacion | TEXT | Educación y formación |
| certificaciones | TEXT[] | Lista de certificaciones |
| biografia | TEXT | Biografía del doctor |
| tarifa_consulta | DECIMAL | Tarifa por consulta |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 🏥 **pacientes** (patients)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| usuario_id | UUID | Referencia a usuarios |
| fecha_nacimiento | DATE | Fecha de nacimiento |
| tipo_sangre | TEXT | Tipo de sangre |
| alergias | TEXT[] | Lista de alergias |
| contacto_emergencia | TEXT | Nombre de contacto de emergencia |
| telefono_emergencia | TEXT | Teléfono de emergencia |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 📅 **citas** (appointments)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| paciente_id | UUID | Referencia a pacientes |
| doctor_id | UUID | Referencia a doctores |
| fecha_cita | DATE | Fecha de la cita |
| hora_cita | TIME | Hora de la cita |
| estado | TEXT | Estado: 'pendiente', 'confirmada', 'completada', 'cancelada' |
| motivo | TEXT | Motivo de la consulta |
| notas | TEXT | Notas adicionales |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 📋 **historiales_medicos** (medical_records)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| paciente_id | UUID | Referencia a pacientes |
| doctor_id | UUID | Referencia a doctores |
| cita_id | UUID | Referencia a citas (opcional) |
| diagnostico | TEXT | Diagnóstico médico |
| tratamiento | TEXT | Tratamiento prescrito |
| notas | TEXT | Notas adicionales |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 💊 **recetas** (prescriptions)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| historial_medico_id | UUID | Referencia a historiales_medicos |
| paciente_id | UUID | Referencia a pacientes |
| doctor_id | UUID | Referencia a doctores |
| nombre_medicamento | TEXT | Nombre del medicamento |
| dosis | TEXT | Dosis prescrita |
| frecuencia | TEXT | Frecuencia de administración |
| duracion | TEXT | Duración del tratamiento |
| instrucciones | TEXT | Instrucciones especiales |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 🔬 **resultados_laboratorio** (lab_results)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| paciente_id | UUID | Referencia a pacientes |
| doctor_id | UUID | Referencia a doctores |
| nombre_prueba | TEXT | Nombre de la prueba |
| fecha_prueba | DATE | Fecha de la prueba |
| resultados | JSONB | Resultados en formato JSON |
| url_archivo | TEXT | URL del archivo de resultados |
| notas | TEXT | Notas adicionales |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

### 🏥 **servicios** (services)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| nombre | TEXT | Nombre del servicio |
| descripcion | TEXT | Descripción del servicio |
| precio | DECIMAL | Precio del servicio |
| duracion_minutos | INTEGER | Duración en minutos |
| icono | TEXT | Emoji o icono |
| activo | BOOLEAN | Si el servicio está activo |
| creado_en | TIMESTAMP | Fecha de creación |
| actualizado_en | TIMESTAMP | Fecha de última actualización |

---

## 🔐 Valores de Enumeración

### Roles de Usuario (rol)
- `paciente` - Usuario que recibe atención médica
- `doctor` - Profesional médico
- `admin` - Administrador del sistema

### Estados de Cita (estado)
- `pendiente` - Cita solicitada, esperando confirmación
- `confirmada` - Cita confirmada por el doctor
- `completada` - Cita realizada
- `cancelada` - Cita cancelada

---

## 📚 Funciones Helper en TypeScript

### Tipos Principales

```typescript
type RolUsuario = 'paciente' | 'doctor' | 'admin';

interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  url_avatar?: string;
  telefono?: string;
  creado_en: string;
  actualizado_en: string;
}
```

### Funciones de Autenticación

```typescript
// Registrar usuario
signUp(email, password, nombreCompleto, rol)

// Iniciar sesión
signIn(email, password)

// Cerrar sesión
signOut()

// Obtener usuario actual
getCurrentUser()

// Restablecer contraseña
resetPassword(email)
```

### Funciones de Base de Datos

```typescript
// Usuarios
getUserProfile(userId)
updateUserProfile(userId, updates)

// Doctores
getDoctores()

// Citas
getCitas(userId, rol)
createCita(cita)
updateCita(id, updates)

// Servicios
getServicios()

// Historiales Médicos
getHistorialesMedicos(pacienteId)
createHistorialMedico(historial)

// Recetas
getRecetas(pacienteId)
createReceta(receta)

// Resultados de Laboratorio
getResultadosLaboratorio(pacienteId)
```

---

## 🎯 Ejemplos de Uso

### Crear una Cita

```typescript
const nuevaCita = {
  paciente_id: 'uuid-del-paciente',
  doctor_id: 'uuid-del-doctor',
  fecha_cita: '2024-01-15',
  hora_cita: '10:00',
  estado: 'pendiente',
  motivo: 'Consulta general'
};

const { data, error } = await createCita(nuevaCita);
```

### Obtener Historiales Médicos

```typescript
const { data: historiales, error } = await getHistorialesMedicos(pacienteId);

if (historiales) {
  historiales.forEach(historial => {
    console.log(`Diagnóstico: ${historial.diagnostico}`);
    console.log(`Tratamiento: ${historial.tratamiento}`);
    console.log(`Doctor: ${historial.doctor.usuario.nombre_completo}`);
  });
}
```

### Crear una Receta

```typescript
const nuevaReceta = {
  historial_medico_id: 'uuid-del-historial',
  paciente_id: 'uuid-del-paciente',
  doctor_id: 'uuid-del-doctor',
  nombre_medicamento: 'Paracetamol',
  dosis: '500mg',
  frecuencia: 'Cada 8 horas',
  duracion: '7 días',
  instrucciones: 'Tomar después de las comidas'
};

const { data, error } = await createReceta(nuevaReceta);
```

---

## 🔍 Consultas SQL Útiles

### Obtener todas las citas de un paciente con información del doctor

```sql
SELECT 
  c.*,
  u.nombre_completo as nombre_doctor,
  d.especialidad
FROM citas c
JOIN doctores d ON c.doctor_id = d.id
JOIN usuarios u ON d.usuario_id = u.id
WHERE c.paciente_id = 'uuid-del-paciente'
ORDER BY c.fecha_cita DESC;
```

### Obtener historiales médicos con recetas

```sql
SELECT 
  hm.*,
  r.nombre_medicamento,
  r.dosis,
  r.frecuencia
FROM historiales_medicos hm
LEFT JOIN recetas r ON r.historial_medico_id = hm.id
WHERE hm.paciente_id = 'uuid-del-paciente'
ORDER BY hm.creado_en DESC;
```

---

**Última actualización**: Diciembre 2024  
**Versión del esquema**: 1.0 (Español)
