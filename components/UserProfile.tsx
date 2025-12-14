'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase, signOut } from '@/lib/supabase';
import styles from './UserProfile.module.css';

export default function UserProfile() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [dbProfile, setDbProfile] = useState<any>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            if (user) {
                const { data: usuarioData } = await supabase
                    .from('usuarios')
                    .select('nombre_completo, rol, url_avatar')
                    .eq('id', user.id)
                    .single();
                setDbProfile(usuarioData);
            } else {
                setDbProfile(null);
            }

            setLoading(false);
        };

        getUser();

        // Escuchar cambios en la autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                setUser(session?.user || null);

                const signedInUser = session?.user;
                if (signedInUser) {
                    supabase
                        .from('usuarios')
                        .select('nombre_completo, rol, url_avatar')
                        .eq('id', signedInUser.id)
                        .single()
                        .then(({ data }) => setDbProfile(data));
                }
            } else if (event === 'SIGNED_OUT') {
                setUser(null);
                setDbProfile(null);
                setIsOpen(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleLogout = async () => {
        await signOut();
        setIsOpen(false);
        router.push('/');
        router.refresh();
    };

    const getRoleName = (rol: string) => {
        const roles: { [key: string]: string } = {
            'paciente': 'Paciente',
            'doctor': 'Doctor',
            'admin': 'Administrador'
        };
        return roles[rol] || 'Usuario';
    };

    const getDashboardLink = (rol: string) => {
        const dashboards: { [key: string]: string } = {
            'paciente': '/dashboard/paciente',
            'doctor': '/dashboard/doctor',
            'admin': '/dashboard/admin'
        };
        return dashboards[rol] || '/dashboard/paciente';
    };

    if (loading) {
        return null;
    }

    if (!user) {
        return (
            <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginBtn}>
                    Iniciar Sesión
                </Link>
                <Link href="/register" className="btn btn-primary">
                    Registrarse
                </Link>
            </div>
        );
    }

    const userRole = user.user_metadata?.rol || dbProfile?.rol || 'paciente';
    const userName =
        user.user_metadata?.nombre_completo ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        dbProfile?.nombre_completo ||
        user.email;
    const userAvatar =
        user.user_metadata?.url_avatar ||
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        dbProfile?.url_avatar ||
        null;
    const userInitials = userName
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);

    return (
        <div className={styles.userProfile}>
            <button
                className={styles.profileButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Menú de usuario"
            >
                <div className={styles.avatar}>
                    {userAvatar ? (
                        <img src={userAvatar} alt={userName} />
                    ) : (
                        <span>{userInitials}</span>
                    )}
                </div>
                <div className={styles.userInfo}>
                    <div className={styles.userName}>{userName.split(' ')[0]}</div>
                    <div className={styles.userRole}>{getRoleName(userRole)}</div>
                </div>
                <svg
                    className={`${styles.chevron} ${isOpen ? styles.open : ''}`}
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                >
                    <path
                        d="M5 7.5L10 12.5L15 7.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </button>

            {isOpen && (
                <>
                    <div className={styles.overlay} onClick={() => setIsOpen(false)} />
                    <div className={styles.dropdown}>
                        <div className={styles.dropdownHeader}>
                            <div className={styles.avatarLarge}>
                                {userAvatar ? (
                                    <img src={userAvatar} alt={userName} />
                                ) : (
                                    <span>{userInitials}</span>
                                )}
                            </div>
                            <div className={styles.userDetails}>
                                <div className={styles.userNameLarge}>
                                    {user.user_metadata?.nombre_completo ||
                                        user.user_metadata?.full_name ||
                                        user.user_metadata?.name ||
                                        dbProfile?.nombre_completo ||
                                        user.email}
                                </div>
                                <div className={styles.userEmail}>{user.email}</div>
                                <div className={styles.userRoleBadge}>{getRoleName(userRole)}</div>
                            </div>
                        </div>

                        <div className={styles.dropdownDivider} />

                        <div className={styles.dropdownMenu}>
                            <Link
                                href={getDashboardLink(userRole)}
                                className={styles.menuItem}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className={styles.menuIcon}>📊</span>
                                <span>Mi Dashboard</span>
                            </Link>
                            <Link
                                href="#"
                                className={styles.menuItem}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className={styles.menuIcon}>⚙️</span>
                                <span>Configuración</span>
                            </Link>
                            <Link
                                href="#"
                                className={styles.menuItem}
                                onClick={() => setIsOpen(false)}
                            >
                                <span className={styles.menuIcon}>❓</span>
                                <span>Ayuda</span>
                            </Link>
                        </div>

                        <div className={styles.dropdownDivider} />

                        <button
                            className={styles.logoutButton}
                            onClick={handleLogout}
                        >
                            <span className={styles.menuIcon}>🚪</span>
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
