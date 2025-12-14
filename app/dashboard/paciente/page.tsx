'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase, signOut } from '@/lib/supabase';
import styles from '../dashboard.module.css';

export default function DashboardPaciente() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [userInfo, setUserInfo] = useState<any>(null);
    const [patientData, setPatientData] = useState<any>(null);
    const [pendingPagos, setPendingPagos] = useState<any[]>([]);
    const [loadingPendingPagos, setLoadingPendingPagos] = useState(false);
    const [pendingPagosError, setPendingPagosError] = useState<string | null>(null);
    const [approvedPagos, setApprovedPagos] = useState<any[]>([]);
    const [loadingApprovedPagos, setLoadingApprovedPagos] = useState(false);
    const [approvedPagosError, setApprovedPagosError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                // Cargar información del usuario (código)
                const { data: usuarioData } = await supabase
                    .from('usuarios')
                    .select('codigo_usuario, rol, nombre_completo, url_avatar')
                    .eq('id', user.id)
                    .single();

                setUserInfo(usuarioData);

                // Cargar datos del paciente
                const { data: pacienteData } = await supabase
                    .from('pacientes')
                    .select('*')
                    .eq('usuario_id', user.id)
                    .single();

                setPatientData(pacienteData);

                setLoadingPendingPagos(true);
                setPendingPagosError(null);

                const { data: pagosData, error: pagosError } = await supabase
                    .from('pagos')
                    .select('id, estado, monto, moneda, fecha_cita, hora_cita, motivo, creado_en, voucher_url, servicio:servicios(nombre)')
                    .eq('usuario_id', user.id)
                    .eq('estado', 'pending_verification')
                    .order('creado_en', { ascending: false });

                if (pagosError) {
                    setPendingPagosError(pagosError.message);
                    setPendingPagos([]);
                } else {
                    setPendingPagos(pagosData || []);
                }

                setLoadingPendingPagos(false);

                setLoadingApprovedPagos(true);
                setApprovedPagosError(null);

                const { data: approvedData, error: approvedError } = await supabase
                    .from('pagos')
                    .select('id, estado, monto, moneda, fecha_cita, hora_cita, motivo, creado_en, voucher_url, servicio:servicios(nombre)')
                    .eq('usuario_id', user.id)
                    .eq('estado', 'approved')
                    .order('creado_en', { ascending: false });

                if (approvedError) {
                    setApprovedPagosError(approvedError.message);
                    setApprovedPagos([]);
                } else {
                    setApprovedPagos(approvedData || []);
                }

                setLoadingApprovedPagos(false);
            }

            setLoading(false);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        await signOut();
        router.push('/login');
    };

    if (loading) {
        return <div>Cargando...</div>;
    }

    const patientName =
        user?.user_metadata?.nombre_completo ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name ||
        userInfo?.nombre_completo ||
        user?.email;

    const getVoucherPublicUrl = (voucherUrlOrPath?: string | null) => {
        if (!voucherUrlOrPath) return null;
        if (/^https?:\/\//i.test(voucherUrlOrPath)) return voucherUrlOrPath;
        const { data } = supabase.storage.from('vouchers').getPublicUrl(voucherUrlOrPath);
        return data?.publicUrl || null;
    };

    const formatCitaDateTime = (fecha?: string | null, hora?: string | null) => {
        if (!fecha && !hora) return '—';
        const datePart = fecha ? new Date(fecha).toLocaleDateString() : '—';
        const timePart = hora ? String(hora).slice(0, 5) : '—';
        return `${datePart} ${timePart}`.trim();
    };

    return (
        <ProtectedRoute allowedRoles={['paciente']}>
            <div className={styles.dashboard}>
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
                            <div className={styles.userSection}>
                                <div className={styles.userInfo}>
                                    <div className={styles.userName}>
                                        {patientName}
                                    </div>
                                    <div className={styles.userRole}>Paciente</div>
                                </div>
                                <button onClick={handleLogout} className={styles.logoutBtn}>
                                    Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>
                    <div className="container">
                        {/* Welcome Section */}
                        <div className={styles.welcomeSection}>
                            <h1 className={styles.welcomeTitle}>
                                ¡Bienvenido, {patientName?.split(' ')[0] || 'Paciente'}! 👋
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                Gestiona tus citas médicas y consulta tu historial de salud
                            </p>

                            {approvedPagos.length > 0 && (
                                <div style={{
                                    marginTop: '1rem',
                                    background: 'rgba(255,255,255,0.15)',
                                    border: '1px solid rgba(255,255,255,0.25)',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    fontWeight: 700,
                                }}>
                                    Tu pago se ha confirmado con éxito.
                                </div>
                            )}
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Próximas Citas</div>
                                        <div className={styles.statValue}>{approvedPagos.length}</div>
                                    </div>
                                    <div className={styles.statIcon}>📅</div>
                                </div>
                                <div className={styles.statChange}>
                                    {approvedPagos.length > 0
                                        ? 'Citas confirmadas'
                                        : 'No tienes citas confirmadas'}
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Recetas Activas</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>💊</div>
                                </div>
                                <div className={styles.statChange}>
                                    Sin recetas activas
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Consultas Totales</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>🏥</div>
                                </div>
                                <div className={styles.statChange}>
                                    Historial vacío
                                </div>
                            </div>
                        </div>

                        {/* Content Grid */}
                        <div className={styles.contentGrid}>
                            {/* Main Content */}
                            <div className={styles.mainContent}>
                                {/* Quick Actions */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Acciones Rápidas</h2>
                                    </div>
                                    <div className={styles.quickActions}>
                                        <Link href="/appointments" className={styles.actionCard} style={{ textDecoration: 'none', color: 'inherit' }}>
                                            <div className={styles.actionIcon}>📅</div>
                                            <h3 className={styles.actionTitle}>Agendar Cita</h3>
                                            <p className={styles.actionDescription}>
                                                Programa una nueva consulta médica
                                            </p>
                                        </Link>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>📋</div>
                                            <h3 className={styles.actionTitle}>Ver Historial</h3>
                                            <p className={styles.actionDescription}>
                                                Consulta tu historial médico
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>💊</div>
                                            <h3 className={styles.actionTitle}>Mis Recetas</h3>
                                            <p className={styles.actionDescription}>
                                                Revisa tus recetas médicas
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>🔬</div>
                                            <h3 className={styles.actionTitle}>Resultados</h3>
                                            <p className={styles.actionDescription}>
                                                Ver resultados de laboratorio
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Próximas Citas */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Próximas Citas</h2>
                                        <Link href="/appointments" className={styles.sectionLink}>
                                            Agendar →
                                        </Link>
                                    </div>
                                    {approvedPagosError && (
                                        <div style={{
                                            background: 'var(--error-light)',
                                            color: 'var(--error-dark)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem',
                                            fontWeight: 600,
                                        }}>
                                            {approvedPagosError}
                                        </div>
                                    )}

                                    {loadingApprovedPagos ? (
                                        <div style={{ padding: '1rem', color: 'var(--gray-600)' }}>Cargando...</div>
                                    ) : approvedPagos.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>📅</div>
                                            <p className={styles.emptyText}>
                                                No tienes citas confirmadas
                                            </p>
                                            <Link href="/appointments" className="btn btn-primary">
                                                Agendar Cita
                                            </Link>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {approvedPagos.map((pago) => {
                                                const voucherLink = getVoucherPublicUrl(pago.voucher_url);
                                                return (
                                                    <div
                                                        key={pago.id}
                                                        style={{
                                                            border: '1px solid var(--gray-200)',
                                                            borderRadius: 'var(--radius-lg)',
                                                            padding: '1rem',
                                                            background: 'var(--success-light)',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>
                                                                    {(pago.servicio?.nombre as string) || 'Servicio'}
                                                                </div>
                                                                <div style={{ fontSize: '0.9375rem', color: 'var(--gray-700)' }}>
                                                                    <strong>Día y hora:</strong> {formatCitaDateTime(pago.fecha_cita, pago.hora_cita)}
                                                                </div>
                                                                {pago.motivo && (
                                                                    <div style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', marginTop: '0.25rem' }}>
                                                                        <strong>Motivo:</strong> {pago.motivo}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                                <div style={{ fontWeight: 800 }}>
                                                                    {pago.moneda === 'PEN' ? 'S/' : pago.moneda}{' '}
                                                                    {Number(pago.monto || 0).toFixed(2)}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 800,
                                                                    color: 'var(--success-dark)',
                                                                }}>
                                                                    approved
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                                Cita confirmada
                                                            </div>

                                                            {voucherLink ? (
                                                                <a
                                                                    href={voucherLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={{ color: 'var(--primary-600)', fontWeight: 800 }}
                                                                >
                                                                    Ver comprobante
                                                                </a>
                                                            ) : (
                                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Sin comprobante</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Pagos pendientes */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Pagos en verificación</h2>
                                    </div>

                                    {pendingPagosError && (
                                        <div style={{
                                            background: 'var(--error-light)',
                                            color: 'var(--error-dark)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem',
                                            fontWeight: 600,
                                        }}>
                                            {pendingPagosError}
                                        </div>
                                    )}

                                    {loadingPendingPagos ? (
                                        <div style={{ padding: '1rem', color: 'var(--gray-600)' }}>Cargando...</div>
                                    ) : pendingPagos.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>⏳</div>
                                            <p className={styles.emptyText}>
                                                No tienes pagos pendientes
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {pendingPagos.map((pago) => {
                                                const voucherLink = getVoucherPublicUrl(pago.voucher_url);
                                                return (
                                                    <div
                                                        key={pago.id}
                                                        style={{
                                                            border: '1px solid var(--gray-200)',
                                                            borderRadius: 'var(--radius-lg)',
                                                            padding: '1rem',
                                                            background: 'var(--gray-50)',
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
                                                            <div>
                                                                <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>
                                                                    {(pago.servicio?.nombre as string) || 'Servicio'}
                                                                </div>
                                                                <div style={{ fontSize: '0.9375rem', color: 'var(--gray-700)' }}>
                                                                    <strong>Fecha:</strong> {pago.fecha_cita || '—'}{' '}
                                                                    <strong>Hora:</strong> {pago.hora_cita || '—'}
                                                                </div>
                                                                {pago.motivo && (
                                                                    <div style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', marginTop: '0.25rem' }}>
                                                                        <strong>Motivo:</strong> {pago.motivo}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            <div style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                                                                <div style={{ fontWeight: 800 }}>
                                                                    {pago.moneda === 'PEN' ? 'S/' : pago.moneda}{' '}
                                                                    {Number(pago.monto || 0).toFixed(2)}
                                                                </div>
                                                                <div style={{
                                                                    fontSize: '0.875rem',
                                                                    fontWeight: 800,
                                                                    color: 'var(--gray-700)',
                                                                }}>
                                                                    {pago.estado}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                                                En espera de validación por administración
                                                            </div>

                                                            {voucherLink ? (
                                                                <a
                                                                    href={voucherLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    style={{ color: 'var(--primary-600)', fontWeight: 800 }}
                                                                >
                                                                    Ver comprobante
                                                                </a>
                                                            ) : (
                                                                <span style={{ fontSize: '0.875rem', color: 'var(--gray-500)' }}>Sin comprobante</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className={styles.sidebar}>
                                {/* Información Personal */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Mi Perfil</h2>
                                        <Link href="/dashboard/paciente/perfil" className={styles.sectionLink}>
                                            Editar
                                        </Link>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Nombre
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {patientName || 'Cargando...'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                ID de Paciente
                                            </div>
                                            <div style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
                                                {userInfo?.codigo_usuario || 'Cargando...'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Email
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {user?.email}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Tipo de Sangre
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {patientData?.tipo_sangre || 'No especificado'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Alergias
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                {patientData?.alergias && patientData.alergias.length > 0
                                                    ? patientData.alergias.join(', ')
                                                    : 'Ninguna registrada'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Recordatorios */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Recordatorios</h2>
                                    </div>
                                    {approvedPagosError && (
                                        <div style={{
                                            background: 'var(--error-light)',
                                            color: 'var(--error-dark)',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-md)',
                                            marginBottom: '1rem',
                                            fontWeight: 600,
                                        }}>
                                            {approvedPagosError}
                                        </div>
                                    )}

                                    {loadingApprovedPagos ? (
                                        <div style={{ padding: '1rem', color: 'var(--gray-600)' }}>Cargando...</div>
                                    ) : approvedPagos.length === 0 ? (
                                        <div className={styles.emptyState}>
                                            <div className={styles.emptyIcon}>🔔</div>
                                            <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)', margin: 0 }}>
                                                No tienes recordatorios
                                            </p>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {approvedPagos.map((pago) => (
                                                <div
                                                    key={pago.id}
                                                    style={{
                                                        border: '1px solid var(--gray-200)',
                                                        borderRadius: 'var(--radius-lg)',
                                                        padding: '1rem',
                                                        background: 'white',
                                                    }}
                                                >
                                                    <div style={{ fontWeight: 800, color: 'var(--gray-900)' }}>
                                                        Cita confirmada: {(pago.servicio?.nombre as string) || 'Servicio'}
                                                    </div>
                                                    <div style={{ fontSize: '0.9375rem', color: 'var(--gray-700)', marginTop: '0.25rem' }}>
                                                        <strong>Día y hora:</strong> {formatCitaDateTime(pago.fecha_cita, pago.hora_cita)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
