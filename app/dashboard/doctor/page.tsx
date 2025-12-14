'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase, signOut } from '@/lib/supabase';
import styles from '../dashboard.module.css';

export default function DashboardDoctor() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
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

    return (
        <ProtectedRoute allowedRoles={['doctor']}>
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
                                        Dr. {user?.user_metadata?.nombre_completo || user?.email}
                                    </div>
                                    <div className={styles.userRole}>Doctor</div>
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
                                ¡Bienvenido, Dr. {user?.user_metadata?.nombre_completo?.split(' ')[0] || 'Doctor'}! 👨‍⚕️
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                Gestiona tus pacientes y consultas médicas de manera eficiente
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Citas Hoy</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>📅</div>
                                </div>
                                <div className={styles.statChange}>
                                    Sin citas programadas para hoy
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Pacientes Activos</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>👥</div>
                                </div>
                                <div className={styles.statChange}>
                                    Sin pacientes registrados
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Consultas Mes</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>🏥</div>
                                </div>
                                <div className={styles.statChange}>
                                    Diciembre 2024
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Recetas Emitidas</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>💊</div>
                                </div>
                                <div className={styles.statChange}>
                                    Este mes
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
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>👥</div>
                                            <h3 className={styles.actionTitle}>Mis Pacientes</h3>
                                            <p className={styles.actionDescription}>
                                                Ver lista de pacientes
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>📅</div>
                                            <h3 className={styles.actionTitle}>Agenda</h3>
                                            <p className={styles.actionDescription}>
                                                Gestionar citas médicas
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>📋</div>
                                            <h3 className={styles.actionTitle}>Historiales</h3>
                                            <p className={styles.actionDescription}>
                                                Consultar historiales médicos
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>💊</div>
                                            <h3 className={styles.actionTitle}>Recetas</h3>
                                            <p className={styles.actionDescription}>
                                                Emitir recetas médicas
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>🔬</div>
                                            <h3 className={styles.actionTitle}>Laboratorio</h3>
                                            <p className={styles.actionDescription}>
                                                Solicitar análisis clínicos
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>📊</div>
                                            <h3 className={styles.actionTitle}>Reportes</h3>
                                            <p className={styles.actionDescription}>
                                                Ver estadísticas y reportes
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Citas de Hoy */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Citas de Hoy</h2>
                                        <Link href="#" className={styles.sectionLink}>
                                            Ver agenda completa →
                                        </Link>
                                    </div>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>📅</div>
                                        <p className={styles.emptyText}>
                                            No tienes citas programadas para hoy
                                        </p>
                                        <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)' }}>
                                            Las citas aparecerán aquí cuando los pacientes las agenden
                                        </p>
                                    </div>
                                </div>

                                {/* Pacientes Recientes */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Pacientes Recientes</h2>
                                        <Link href="#" className={styles.sectionLink}>
                                            Ver todos →
                                        </Link>
                                    </div>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>👥</div>
                                        <p className={styles.emptyText}>
                                            Aún no tienes pacientes registrados
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className={styles.sidebar}>
                                {/* Perfil Profesional */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Mi Perfil</h2>
                                        <Link href="#" className={styles.sectionLink}>
                                            Editar
                                        </Link>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                                                Especialidad
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                No especificada
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Licencia Médica
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                No registrada
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)', marginBottom: '0.25rem' }}>
                                                Años de Experiencia
                                            </div>
                                            <div style={{ fontWeight: 600 }}>
                                                No especificado
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Notificaciones */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Notificaciones</h2>
                                    </div>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>🔔</div>
                                        <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)', margin: 0 }}>
                                            No tienes notificaciones
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </ProtectedRoute>
    );
}
