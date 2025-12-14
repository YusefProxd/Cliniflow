-- ============================================
-- Esquema de Base de Datos CliniFlow
-- ============================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  nombre_completo TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('paciente', 'doctor', 'admin')),
  url_avatar TEXT,
  telefono TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA DOCTORES
-- ============================================
CREATE TABLE IF NOT EXISTS doctores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  especialidad TEXT NOT NULL,
  numero_licencia TEXT UNIQUE NOT NULL,
  anos_experiencia INTEGER DEFAULT 0,
  educacion TEXT,
  certificaciones TEXT[],
  biografia TEXT,
  tarifa_consulta DECIMAL(10, 2),
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA PACIENTES
-- ============================================
CREATE TABLE IF NOT EXISTS pacientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE NOT NULL,
  fecha_nacimiento DATE,
  tipo_sangre TEXT,
  alergias TEXT[],
  contacto_emergencia TEXT,
  telefono_emergencia TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA SERVICIOS
-- ============================================
CREATE TABLE IF NOT EXISTS servicios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10, 2),
  duracion_minutos INTEGER,
  icono TEXT,
  activo BOOLEAN DEFAULT TRUE,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA CITAS
-- ============================================
CREATE TABLE IF NOT EXISTS citas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctores(id) ON DELETE CASCADE NOT NULL,
  fecha_cita DATE NOT NULL,
  hora_cita TIME NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('pendiente', 'confirmada', 'completada', 'cancelada')) DEFAULT 'pendiente',
  motivo TEXT,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA HISTORIALES MEDICOS
-- ============================================
CREATE TABLE IF NOT EXISTS historiales_medicos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctores(id) ON DELETE CASCADE NOT NULL,
  cita_id UUID REFERENCES citas(id) ON DELETE SET NULL,
  diagnostico TEXT NOT NULL,
  tratamiento TEXT NOT NULL,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA RECETAS
-- ============================================
CREATE TABLE IF NOT EXISTS recetas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  historial_medico_id UUID REFERENCES historiales_medicos(id) ON DELETE CASCADE NOT NULL,
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctores(id) ON DELETE CASCADE NOT NULL,
  nombre_medicamento TEXT NOT NULL,
  dosis TEXT NOT NULL,
  frecuencia TEXT NOT NULL,
  duracion TEXT NOT NULL,
  instrucciones TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABLA RESULTADOS DE LABORATORIO
-- ============================================
CREATE TABLE IF NOT EXISTS resultados_laboratorio (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  paciente_id UUID REFERENCES pacientes(id) ON DELETE CASCADE NOT NULL,
  doctor_id UUID REFERENCES doctores(id) ON DELETE CASCADE,
  nombre_prueba TEXT NOT NULL,
  fecha_prueba DATE NOT NULL,
  resultados JSONB,
  url_archivo TEXT,
  notas TEXT,
  creado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  actualizado_en TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
CREATE INDEX IF NOT EXISTS idx_doctores_usuario_id ON doctores(usuario_id);
CREATE INDEX IF NOT EXISTS idx_doctores_especialidad ON doctores(especialidad);
CREATE INDEX IF NOT EXISTS idx_pacientes_usuario_id ON pacientes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_citas_paciente_id ON citas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_citas_doctor_id ON citas(doctor_id);
CREATE INDEX IF NOT EXISTS idx_citas_fecha ON citas(fecha_cita);
CREATE INDEX IF NOT EXISTS idx_citas_estado ON citas(estado);
CREATE INDEX IF NOT EXISTS idx_historiales_paciente_id ON historiales_medicos(paciente_id);
CREATE INDEX IF NOT EXISTS idx_recetas_paciente_id ON recetas(paciente_id);
CREATE INDEX IF NOT EXISTS idx_resultados_lab_paciente_id ON resultados_laboratorio(paciente_id);

-- ============================================
-- TRIGGERS PARA ACTUALIZADO_EN
-- ============================================
CREATE OR REPLACE FUNCTION actualizar_columna_actualizado_en()
RETURNS TRIGGER AS $$
BEGIN
  NEW.actualizado_en = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER actualizar_usuarios_actualizado_en BEFORE UPDATE ON usuarios
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_doctores_actualizado_en BEFORE UPDATE ON doctores
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_pacientes_actualizado_en BEFORE UPDATE ON pacientes
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_citas_actualizado_en BEFORE UPDATE ON citas
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_historiales_actualizado_en BEFORE UPDATE ON historiales_medicos
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_recetas_actualizado_en BEFORE UPDATE ON recetas
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_servicios_actualizado_en BEFORE UPDATE ON servicios
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

CREATE TRIGGER actualizar_resultados_lab_actualizado_en BEFORE UPDATE ON resultados_laboratorio
  FOR EACH ROW EXECUTE FUNCTION actualizar_columna_actualizado_en();

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctores ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas ENABLE ROW LEVEL SECURITY;
ALTER TABLE historiales_medicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE recetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE resultados_laboratorio ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicios ENABLE ROW LEVEL SECURITY;

-- Políticas para usuarios
CREATE POLICY "Los usuarios pueden ver su propio perfil" ON usuarios
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON usuarios
  FOR UPDATE USING (auth.uid() = id);

-- Políticas para doctores
CREATE POLICY "Cualquiera puede ver doctores" ON doctores
  FOR SELECT USING (true);

CREATE POLICY "Los doctores pueden actualizar su propio perfil" ON doctores
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Políticas para pacientes
CREATE POLICY "Los pacientes pueden ver su propio perfil" ON pacientes
  FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Los pacientes pueden actualizar su propio perfil" ON pacientes
  FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Los doctores pueden ver perfiles de pacientes" ON pacientes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.usuario_id = auth.uid()
    )
  );

-- Políticas para citas
CREATE POLICY "Los pacientes pueden ver sus propias citas" ON citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes WHERE pacientes.id = citas.paciente_id AND pacientes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los doctores pueden ver sus propias citas" ON citas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.id = citas.doctor_id AND doctores.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los pacientes pueden crear citas" ON citas
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM pacientes WHERE pacientes.id = citas.paciente_id AND pacientes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los doctores pueden actualizar citas" ON citas
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.id = citas.doctor_id AND doctores.usuario_id = auth.uid()
    )
  );

-- Políticas para servicios
CREATE POLICY "Cualquiera puede ver servicios activos" ON servicios
  FOR SELECT USING (activo = true);

-- Políticas para historiales médicos
CREATE POLICY "Los pacientes pueden ver sus propios historiales" ON historiales_medicos
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes WHERE pacientes.id = historiales_medicos.paciente_id AND pacientes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los doctores pueden ver y crear historiales médicos" ON historiales_medicos
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.id = historiales_medicos.doctor_id AND doctores.usuario_id = auth.uid()
    )
  );

-- Políticas para recetas
CREATE POLICY "Los pacientes pueden ver sus propias recetas" ON recetas
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes WHERE pacientes.id = recetas.paciente_id AND pacientes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los doctores pueden crear y ver recetas" ON recetas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.id = recetas.doctor_id AND doctores.usuario_id = auth.uid()
    )
  );

-- Políticas para resultados de laboratorio
CREATE POLICY "Los pacientes pueden ver sus propios resultados" ON resultados_laboratorio
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pacientes WHERE pacientes.id = resultados_laboratorio.paciente_id AND pacientes.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Los doctores pueden ver y crear resultados de laboratorio" ON resultados_laboratorio
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM doctores WHERE doctores.id = resultados_laboratorio.doctor_id AND doctores.usuario_id = auth.uid()
    )
  );

-- ============================================
-- DATOS DE EJEMPLO - Servicios
-- ============================================
INSERT INTO servicios (nombre, descripcion, precio, duracion_minutos, icono, activo) VALUES
  ('Consulta General', 'Evaluación médica general y diagnóstico inicial', 80.00, 30, '🩺', true),
  ('Cardiología', 'Evaluación y tratamiento de enfermedades cardiovasculares', 150.00, 45, '❤️', true),
  ('Pediatría', 'Atención médica especializada para niños y adolescentes', 100.00, 30, '👶', true),
  ('Traumatología', 'Diagnóstico y tratamiento de lesiones musculoesqueléticas', 120.00, 40, '🦴', true),
  ('Neurología', 'Evaluación y tratamiento de trastornos del sistema nervioso', 180.00, 45, '🧠', true),
  ('Análisis Clínicos', 'Pruebas de laboratorio completas', 60.00, 15, '🔬', true),
  ('Radiología', 'Estudios de imagen diagnóstica', 100.00, 20, '📷', true),
  ('Vacunación', 'Aplicación de vacunas preventivas', 40.00, 15, '💉', true),
  ('Telemedicina', 'Consulta médica virtual por videollamada', 60.00, 25, '💻', true)
ON CONFLICT DO NOTHING;
