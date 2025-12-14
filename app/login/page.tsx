'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/supabase';
import styles from './login.module.css';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error } = await signIn(email, password);

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            if (data?.user) {
                // Redirect to home page
                router.push('/');
            }
        } catch (err) {
            setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            const { signInWithGoogle } = await import('@/lib/supabase');
            const { error } = await signInWithGoogle();

            if (error) {
                setError('Error al iniciar sesión con Google: ' + error.message);
            }
            // La redirección se maneja automáticamente por Supabase
        } catch (err) {
            setError('Ocurrió un error al conectar con Google.');
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.leftPanel}>
                <div className={styles.brandSection}>
                    <Link href="/" className={styles.logoLink}>
                        <Image
                            src="/logo.png"
                            alt="CliniFlow Logo"
                            width={60}
                            height={60}
                            className={styles.logo}
                        />
                        <span className={styles.brandName}>CliniFlow</span>
                    </Link>
                    <h1 className={styles.welcomeTitle}>
                        Bienvenido de vuelta
                    </h1>
                    <p className={styles.welcomeText}>
                        Accede a tu cuenta para gestionar tus citas médicas,
                        consultar tu historial clínico y más.
                    </p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📅</span>
                        <div>
                            <h3>Agenda tus citas</h3>
                            <p>Programa consultas en minutos</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📋</span>
                        <div>
                            <h3>Historial médico</h3>
                            <p>Accede a tu información de salud</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>💊</span>
                        <div>
                            <h3>Recetas digitales</h3>
                            <p>Consulta tus prescripciones</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Iniciar Sesión</h2>
                        <p>Ingresa tus credenciales para continuar</p>
                    </div>

                    {error && (
                        <div className={styles.errorAlert}>
                            <span className={styles.errorIcon}>⚠️</span>
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGroup}>
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formOptions}>
                            <label className={styles.checkbox}>
                                <input type="checkbox" />
                                <span>Recordarme</span>
                            </label>
                            <Link href="/forgot-password" className={styles.forgotLink}>
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`btn btn-primary ${styles.submitBtn}`}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Iniciar Sesión'
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <span>o continúa con</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        className={styles.googleBtn}
                        disabled={loading}
                    >
                        <svg className={styles.googleIcon} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    <div className={styles.signupPrompt}>
                        <p>
                            ¿No tienes una cuenta?{' '}
                            <Link href="/register" className={styles.signupLink}>
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
