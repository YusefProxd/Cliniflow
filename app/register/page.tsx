'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { signUp } from '@/lib/supabase';
import styles from './register.module.css';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        acceptTerms: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            setError('Por favor, ingresa tu nombre completo');
            return false;
        }
        if (!formData.email.trim()) {
            setError('Por favor, ingresa tu correo electrónico');
            return false;
        }
        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return false;
        }
        if (!formData.acceptTerms) {
            setError('Debes aceptar los términos y condiciones');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) {
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await signUp(
                formData.email,
                formData.password,
                formData.fullName,
                'paciente' // Todos los registros son pacientes por defecto
            );

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            if (data?.user) {
                setSuccess(true);
                // Redirect to home after 2 seconds
                setTimeout(() => {
                    router.push('/');
                }, 2000);
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
                        Únete a CliniFlow
                    </h1>
                    <p className={styles.welcomeText}>
                        Crea tu cuenta y comienza a disfrutar de una experiencia
                        médica moderna, eficiente y personalizada.
                    </p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>⚡</span>
                        <div>
                            <h3>Registro rápido</h3>
                            <p>Solo toma 2 minutos</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🔒</span>
                        <div>
                            <h3>100% Seguro</h3>
                            <p>Tus datos están protegidos</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🎯</span>
                        <div>
                            <h3>Acceso inmediato</h3>
                            <p>Comienza a usar la plataforma al instante</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.formContainer}>
                    <div className={styles.formHeader}>
                        <h2>Crear Cuenta</h2>
                        <p>Completa el formulario para registrarte</p>
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
                            <p>¡Cuenta creada exitosamente! Redirigiendo...</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>

                        <div className={styles.formGroup}>
                            <label htmlFor="fullName">Nombre Completo</label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                value={formData.fullName}
                                onChange={handleInputChange}
                                placeholder="Juan Pérez García"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="email">Correo Electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="tu@email.com"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="phone">Teléfono (Opcional)</label>
                            <input
                                id="phone"
                                name="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="+51 987 654 321"
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="password">Contraseña</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Mínimo 6 caracteres"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Repite tu contraseña"
                                required
                                disabled={loading}
                                className={styles.input}
                            />
                        </div>

                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                name="acceptTerms"
                                checked={formData.acceptTerms}
                                onChange={handleInputChange}
                                disabled={loading}
                            />
                            <span>
                                Acepto los{' '}
                                <Link href="/terms" className={styles.link}>
                                    términos y condiciones
                                </Link>{' '}
                                y la{' '}
                                <Link href="/privacy" className={styles.link}>
                                    política de privacidad
                                </Link>
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={loading || success}
                            className={`btn btn-primary ${styles.submitBtn}`}
                        >
                            {loading ? (
                                <>
                                    <span className={styles.spinner}></span>
                                    Creando cuenta...
                                </>
                            ) : success ? (
                                'Cuenta creada ✓'
                            ) : (
                                'Crear Cuenta'
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
                        disabled={loading || success}
                    >
                        <svg className={styles.googleIcon} viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar con Google
                    </button>

                    <div className={styles.loginPrompt}>
                        <p>
                            ¿Ya tienes una cuenta?{' '}
                            <Link href="/login" className={styles.loginLink}>
                                Inicia sesión aquí
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
