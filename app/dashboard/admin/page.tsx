'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { supabase, signOut } from '@/lib/supabase';
import styles from '../dashboard.module.css';

export default function DashboardAdmin() {
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
        <ProtectedRoute allowedRoles={['admin']}>
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
                                        {user?.user_metadata?.nombre_completo || user?.email}
                                    </div>
                                    <div className={styles.userRole}>Administrador</div>
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
                                Panel de Administración 🛡️
                            </h1>
                            <p className={styles.welcomeSubtitle}>
                                Gestiona el sistema CliniFlow y supervisa todas las operaciones
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className={styles.statsGrid}>
                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Total Usuarios</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>👥</div>
                                </div>
                                <div className={styles.statChange}>
                                    Sistema recién configurado
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Doctores</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>👨‍⚕️</div>
                                </div>
                                <div className={styles.statChange}>
                                    Activos en el sistema
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Pacientes</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>🏥</div>
                                </div>
                                <div className={styles.statChange}>
                                    Registrados en el sistema
                                </div>
                            </div>

                            <div className={styles.statCard}>
                                <div className={styles.statHeader}>
                                    <div>
                                        <div className={styles.statLabel}>Citas Totales</div>
                                        <div className={styles.statValue}>0</div>
                                    </div>
                                    <div className={styles.statIcon}>📅</div>
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
                                        <h2 className={styles.sectionTitle}>Gestión del Sistema</h2>
                                    </div>
                                    <div className={styles.quickActions}>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>👥</div>
                                            <h3 className={styles.actionTitle}>Usuarios</h3>
                                            <p className={styles.actionDescription}>
                                                Gestionar usuarios del sistema
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>👨‍⚕️</div>
                                            <h3 className={styles.actionTitle}>Doctores</h3>
                                            <p className={styles.actionDescription}>
                                                Administrar personal médico
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>🏥</div>
                                            <h3 className={styles.actionTitle}>Servicios</h3>
                                            <p className={styles.actionDescription}>
                                                Configurar servicios médicos
                                            </p>
                                        </div>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>📊</div>
                                            <h3 className={styles.actionTitle}>Reportes</h3>
                                            <p className={styles.actionDescription}>
                                                Ver estadísticas y reportes
                                            </p>
                                        </div>
                                        <Link
                                            href="/dashboard/admin/pagos"
                                            className={styles.actionCard}
                                            style={{ textDecoration: 'none', color: 'inherit' }}
                                        >
                                            <div className={styles.actionIcon}>💰</div>
                                            <h3 className={styles.actionTitle}>Finanzas</h3>
                                            <p className={styles.actionDescription}>
                                                Gestión financiera
                                            </p>
                                        </Link>
                                        <div className={styles.actionCard}>
                                            <div className={styles.actionIcon}>⚙️</div>
                                            <h3 className={styles.actionTitle}>Configuración</h3>
                                            <p className={styles.actionDescription}>
                                                Ajustes del sistema
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actividad Reciente */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Actividad Reciente</h2>
                                        <Link href="#" className={styles.sectionLink}>
                                            Ver todo →
                                        </Link>
                                    </div>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>📋</div>
                                        <p className={styles.emptyText}>
                                            No hay actividad reciente
                                        </p>
                                        <p style={{ fontSize: '0.9375rem', color: 'var(--gray-600)' }}>
                                            Las acciones del sistema aparecerán aquí
                                        </p>
                                    </div>
                                </div>

                                {/* Usuarios Recientes */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Usuarios Recientes</h2>
                                        <Link href="#" className={styles.sectionLink}>
                                            Ver todos →
                                        </Link>
                                    </div>
                                    <div className={styles.emptyState}>
                                        <div className={styles.emptyIcon}>👥</div>
                                        <p className={styles.emptyText}>
                                            No hay usuarios registrados aún
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className={styles.sidebar}>
                                {/* Estado del Sistema */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Estado del Sistema</h2>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: 'var(--success-light)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <span style={{ fontWeight: 600 }}>Base de Datos</span>
                                            <span style={{ color: 'var(--success-dark)' }}>✓ Activa</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: 'var(--success-light)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <span style={{ fontWeight: 600 }}>Autenticación</span>
                                            <span style={{ color: 'var(--success-dark)' }}>✓ Activa</span>
                                        </div>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.75rem',
                                            background: 'var(--success-light)',
                                            borderRadius: 'var(--radius-md)'
                                        }}>
                                            <span style={{ fontWeight: 600 }}>Storage</span>
                                            <span style={{ color: 'var(--success-dark)' }}>✓ Activo</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Accesos Rápidos */}
                                <div className={styles.section}>
                                    <div className={styles.sectionHeader}>
                                        <h2 className={styles.sectionTitle}>Accesos Rápidos</h2>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <Link href="#" style={{
                                            padding: '0.75rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500,
                                            transition: 'all var(--transition-base)'
                                        }}>
                                            📊 Dashboard de Analytics
                                        </Link>
                                        <Link href="#" style={{
                                            padding: '0.75rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500,
                                            transition: 'all var(--transition-base)'
                                        }}>
                                            🔐 Gestión de Permisos
                                        </Link>
                                        <Link href="#" style={{
                                            padding: '0.75rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500,
                                            transition: 'all var(--transition-base)'
                                        }}>
                                            📝 Logs del Sistema
                                        </Link>
                                        <Link href="#" style={{
                                            padding: '0.75rem',
                                            background: 'var(--gray-50)',
                                            borderRadius: 'var(--radius-md)',
                                            fontWeight: 500,
                                            transition: 'all var(--transition-base)'
                                        }}>
                                            ⚙️ Configuración Avanzada
                                        </Link>
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
