import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para nuestra base de datos
export type RolUsuario = 'paciente' | 'doctor' | 'admin';

export interface Usuario {
  id: string;
  email: string;
  nombre_completo: string;
  rol: RolUsuario;
  url_avatar?: string;
  telefono?: string;
  creado_en: string;
  actualizado_en: string;
}

export interface Doctor {
  id: string;
  usuario_id: string;
  especialidad: string;
  numero_licencia: string;
  anos_experiencia: number;
  educacion: string;
  certificaciones?: string[];
  biografia?: string;
  tarifa_consulta?: number;
}

export interface Paciente {
  id: string;
  usuario_id: string;
  fecha_nacimiento?: string;
  tipo_sangre?: string;
  alergias?: string[];
  contacto_emergencia?: string;
  telefono_emergencia?: string;
}

export interface Cita {
  id: string;
  paciente_id: string;
  doctor_id: string;
  fecha_cita: string;
  hora_cita: string;
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada';
  motivo?: string;
  notas?: string;
  creado_en: string;
}

export interface HistorialMedico {
  id: string;
  paciente_id: string;
  doctor_id: string;
  cita_id?: string;
  diagnostico: string;
  tratamiento: string;
  notas?: string;
  creado_en: string;
}

export interface Receta {
  id: string;
  historial_medico_id: string;
  paciente_id: string;
  doctor_id: string;
  nombre_medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  instrucciones?: string;
  creado_en: string;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  duracion_minutos: number;
  icono?: string;
  activo: boolean;
}

// Helpers de autenticación
export const signUp = async (email: string, password: string, nombreCompleto: string, rol: RolUsuario = 'paciente') => {
  // Paso 1: Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre_completo: nombreCompleto,
        rol: rol,
      },
    },
  });

  // Paso 2: Si el usuario se creó exitosamente, crear su perfil en la base de datos
  if (data.user && !error) {
    try {
      const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
        p_user_id: data.user.id,
        p_email: email,
        p_nombre_completo: nombreCompleto,
        p_rol: rol,
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
      } else {
        console.log('User profile created:', profileData);
      }
    } catch (err) {
      console.error('Exception creating profile:', err);
    }
  }

  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
};

export const resetPassword = async (email: string) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  return { data, error };
};

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  return { data, error };
};

// Helpers de base de datos
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
};

export const updateUserProfile = async (userId: string, updates: Partial<Usuario>) => {
  const { data, error } = await supabase
    .from('usuarios')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
};

export const getDoctores = async () => {
  const { data, error } = await supabase
    .from('doctores')
    .select(`
      *,
      usuarios (
        id,
        nombre_completo,
        email,
        url_avatar,
        telefono
      )
    `);
  return { data, error };
};

export const getCitas = async (userId: string, rol: RolUsuario) => {
  const column = rol === 'paciente' ? 'paciente_id' : 'doctor_id';
  const { data, error } = await supabase
    .from('citas')
    .select(`
      *,
      paciente:pacientes!citas_paciente_id_fkey (
        *,
        usuario:usuarios (*)
      ),
      doctor:doctores!citas_doctor_id_fkey (
        *,
        usuario:usuarios (*)
      )
    `)
    .eq(column, userId)
    .order('fecha_cita', { ascending: true });
  return { data, error };
};

export const createCita = async (cita: Omit<Cita, 'id' | 'creado_en'>) => {
  const { data, error } = await supabase
    .from('citas')
    .insert([cita])
    .select()
    .single();
  return { data, error };
};

export const updateCita = async (id: string, updates: Partial<Cita>) => {
  const { data, error } = await supabase
    .from('citas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const getServicios = async () => {
  const { data, error } = await supabase
    .from('servicios')
    .select('*')
    .eq('activo', true)
    .order('nombre');
  return { data, error };
};

export const getHistorialesMedicos = async (pacienteId: string) => {
  const { data, error } = await supabase
    .from('historiales_medicos')
    .select(`
      *,
      doctor:doctores (
        *,
        usuario:usuarios (nombre_completo)
      )
    `)
    .eq('paciente_id', pacienteId)
    .order('creado_en', { ascending: false });
  return { data, error };
};

export const createHistorialMedico = async (historial: Omit<HistorialMedico, 'id' | 'creado_en'>) => {
  const { data, error } = await supabase
    .from('historiales_medicos')
    .insert([historial])
    .select()
    .single();
  return { data, error };
};

export const getRecetas = async (pacienteId: string) => {
  const { data, error } = await supabase
    .from('recetas')
    .select(`
      *,
      doctor:doctores (
        *,
        usuario:usuarios (nombre_completo)
      )
    `)
    .eq('paciente_id', pacienteId)
    .order('creado_en', { ascending: false });
  return { data, error };
};

export const createReceta = async (receta: Omit<Receta, 'id' | 'creado_en'>) => {
  const { data, error } = await supabase
    .from('recetas')
    .insert([receta])
    .select()
    .single();
  return { data, error };
};

export const getResultadosLaboratorio = async (pacienteId: string) => {
  const { data, error } = await supabase
    .from('resultados_laboratorio')
    .select(`
      *,
      doctor:doctores (
        *,
        usuario:usuarios (nombre_completo)
      )
    `)
    .eq('paciente_id', pacienteId)
    .order('fecha_prueba', { ascending: false });
  return { data, error };
};
