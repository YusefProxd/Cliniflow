'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase } from '@/lib/supabase';
import styles from './perfil.module.css';

interface PatientProfile {
    fecha_nacimiento: string;
    tipo_sangre: string;
    alergias: string[];
    contacto_emergencia: string;
    telefono_emergencia: string;
}

export default function PerfilPaciente() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any>(null); // Info adicional de la tabla usuarios
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState<PatientProfile>({
        fecha_nacimiento: '',
        tipo_sangre: '',
        alergias: [],
        contacto_emergencia: '',
        telefono_emergencia: ''
    });

    const [alergiaInput, setAlergiaInput] = useState('');

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    // Obtener información adicional del usuario (incluyendo código)
                    const { data: usuarioData } = await supabase
                        .from('usuarios')
                        .select('codigo_usuario, rol')
                        .eq('id', user.id)
                        .single();

                    setUserInfo(usuarioData);

                    // Obtener datos del paciente
                    const { data: pacienteData, error: pacienteError } = await supabase
                        .from('pacientes')
                        .select('*')
                        .eq('usuario_id', user.id)
                        .single();

                    if (pacienteData && !pacienteError) {
                        setFormData({
                            fecha_nacimiento: pacienteData.fecha_nacimiento || '',
                            tipo_sangre: pacienteData.tipo_sangre || '',
                            alergias: pacienteData.alergias || [],
                            contacto_emergencia: pacienteData.contacto_emergencia || '',
                            telefono_emergencia: pacienteData.telefono_emergencia || ''
                        });
                    }
                }
            } catch (err) {
                console.error('Error loading user data:', err);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddAlergia = () => {
        if (alergiaInput.trim() && !formData.alergias.includes(alergiaInput.trim())) {
            setFormData(prev => ({
                ...prev,
                alergias: [...prev.alergias, alergiaInput.trim()]
            }));
            setAlergiaInput('');
        }
    };

    const handleRemoveAlergia = (alergia: string) => {
        setFormData(prev => ({
            ...prev,
            alergias: prev.alergias.filter(a => a !== alergia)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSaving(true);

        try {
            if (!user) {
                setError('No se encontró información del usuario');
                setSaving(false);
                return;
            }

            // Verificar si el paciente ya existe
            const { data: existingPatient } = await supabase
                .from('pacientes')
                .select('id')
                .eq('usuario_id', user.id)
                .single();

            if (existingPatient) {
                // Actualizar paciente existente
                const { error: updateError } = await supabase
                    .from('pacientes')
                    .update({
                        fecha_nacimiento: formData.fecha_nacimiento || null,
                        tipo_sangre: formData.tipo_sangre || null,
                        alergias: formData.alergias.length > 0 ? formData.alergias : null,
                        contacto_emergencia: formData.contacto_emergencia || null,
                        telefono_emergencia: formData.telefono_emergencia || null
                    })
                    .eq('usuario_id', user.id);

                if (updateError) throw updateError;
            } else {
                // Crear nuevo registro de paciente
                const { error: insertError } = await supabase
                    .from('pacientes')
                    .insert({
                        usuario_id: user.id,
                        fecha_nacimiento: formData.fecha_nacimiento || null,
                        tipo_sangre: formData.tipo_sangre || null,
                        alergias: formData.alergias.length > 0 ? formData.alergias : null,
                        contacto_emergencia: formData.contacto_emergencia || null,
                        telefono_emergencia: formData.telefono_emergencia || null
                    });

                if (insertError) throw insertError;
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/dashboard/paciente');
            }, 2000);
        } catch (err: any) {
            console.error('Error saving profile:', err);
            setError(err.message || 'Error al guardar el perfil');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute allowedRoles={['paciente']}>
                <div className={styles.loading}>Cargando...</div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute allowedRoles={['paciente']}>
            <div className={styles.container}>
                {/* Header */}
                <header className={styles.header}>
                    <div className="container">
                        <div className={styles.headerContent}>
                            <Link href="/" className={styles.logoSection}>
                                <Image
                                    src="/logo.png"
                                    alt="CliniFlow"
                                    width={40}
                                    height={40}
                                    className={styles.logo}
                                />
                                <span className={styles.brandName}>CliniFlow</span>
                            </Link>
                            <Link href="/dashboard/paciente" className={styles.backLink}>
                                ← Volver al Dashboard
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className="container">
                        <div className={styles.pageHeader}>
                            <h1 className={styles.pageTitle}>Editar Mi Perfil</h1>
                            <p className={styles.pageSubtitle}>
                                Actualiza tu información personal y médica
                            </p>
                        </div>

                        {error && (
                            <div className={styles.errorAlert}>
                                <span className={styles.errorIcon}>⚠️</span>
                                <p>{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className={styles.successAlert}>
                                <span className={styles.successIcon}>✅</span>
                                <p>¡Perfil actualizado exitosamente! Redirigiendo...</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className={styles.form}>
                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Información Personal</h2>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="codigo">ID de Paciente</label>
                                        <input
                                            id="codigo"
                                            type="text"
                                            value={userInfo?.codigo_usuario || 'Generando...'}
                                            disabled
                                            className={styles.input}
                                        />
                                        <span className={styles.helpText}>ID único asignado automáticamente</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="email">Correo Electrónico</label>
                                        <input
                                            id="email"
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className={styles.input}
                                        />
                                        <span className={styles.helpText}>No se puede modificar</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="nombre">Nombre Completo</label>
                                        <input
                                            id="nombre"
                                            type="text"
                                            value={userInfo?.nombre_completo || 'Cargando...'}
                                            disabled
                                            className={styles.input}
                                        />
                                        <span className={styles.helpText}>No se puede modificar</span>
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                                        <input
                                            id="fecha_nacimiento"
                                            name="fecha_nacimiento"
                                            type="date"
                                            value={formData.fecha_nacimiento}
                                            onChange={handleInputChange}
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="tipo_sangre">Tipo de Sangre</label>
                                        <select
                                            id="tipo_sangre"
                                            name="tipo_sangre"
                                            value={formData.tipo_sangre}
                                            onChange={handleInputChange}
                                            className={styles.select}
                                        >
                                            <option value="">Seleccionar...</option>
                                            <option value="A+">A+</option>
                                            <option value="A-">A-</option>
                                            <option value="B+">B+</option>
                                            <option value="B-">B-</option>
                                            <option value="AB+">AB+</option>
                                            <option value="AB-">AB-</option>
                                            <option value="O+">O+</option>
                                            <option value="O-">O-</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Información Médica</h2>

                                <div className={styles.formGroup}>
                                    <label htmlFor="alergias">Alergias</label>
                                    <div className={styles.alergiaInput}>
                                        <input
                                            id="alergias"
                                            type="text"
                                            value={alergiaInput}
                                            onChange={(e) => setAlergiaInput(e.target.value)}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddAlergia();
                                                }
                                            }}
                                            placeholder="Escribe una alergia y presiona Enter"
                                            className={styles.input}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddAlergia}
                                            className={styles.addBtn}
                                        >
                                            Agregar
                                        </button>
                                    </div>

                                    {formData.alergias.length > 0 && (
                                        <div className={styles.alergiaTags}>
                                            {formData.alergias.map((alergia, index) => (
                                                <span key={index} className={styles.alergiaTag}>
                                                    {alergia}
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveAlergia(alergia)}
                                                        className={styles.removeTag}
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.formSection}>
                                <h2 className={styles.sectionTitle}>Contacto de Emergencia</h2>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label htmlFor="contacto_emergencia">Nombre del Contacto</label>
                                        <input
                                            id="contacto_emergencia"
                                            name="contacto_emergencia"
                                            type="text"
                                            value={formData.contacto_emergencia}
                                            onChange={handleInputChange}
                                            placeholder="Ej: María García (Madre)"
                                            className={styles.input}
                                        />
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label htmlFor="telefono_emergencia">Teléfono de Emergencia</label>
                                        <input
                                            id="telefono_emergencia"
                                            name="telefono_emergencia"
                                            type="tel"
                                            value={formData.telefono_emergencia}
                                            onChange={handleInputChange}
                                            placeholder="+51 987 654 321"
                                            className={styles.input}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.formActions}>
                                <Link href="/dashboard/paciente" className="btn btn-outline">
                                    Cancelar
                                </Link>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="btn btn-primary"
                                >
                                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
