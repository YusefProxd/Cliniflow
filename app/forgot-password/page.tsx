'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { resetPassword } from '@/lib/supabase';
import styles from './forgot-password.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.trim()) {
            setError('Por favor, ingresa tu correo electrónico');
            setLoading(false);
            return;
        }

        try {
            const { error } = await resetPassword(email);

            if (error) {
                setError(error.message);
                setLoading(false);
                return;
            }

            setSuccess(true);
            setLoading(false);
        } catch (err) {
            setError('Ocurrió un error inesperado. Por favor, intenta de nuevo.');
            setLoading(false);
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
                        Recupera tu Cuenta
                    </h1>
                    <p className={styles.welcomeText}>
                        No te preocupes, te enviaremos un enlace de recuperación
                        a tu correo electrónico para que puedas restablecer tu contraseña.
                    </p>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>📧</span>
                        <div>
                            <h3>Revisa tu correo</h3>
                            <p>Te enviaremos un enlace seguro</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>🔒</span>
                        <div>
                            <h3>Proceso seguro</h3>
                            <p>Tu información está protegida</p>
                        </div>
                    </div>
                    <div className={styles.feature}>
                        <span className={styles.featureIcon}>⚡</span>
                        <div>
                            <h3>Rápido y fácil</h3>
                            <p>Recupera tu cuenta en minutos</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.rightPanel}>
                <div className={styles.formContainer}>
                    {!success ? (
                        <>
                            <div className={styles.formHeader}>
                                <div className={styles.iconWrapper}>
                                    <span className={styles.headerIcon}>🔑</span>
                                </div>
                                <h2>¿Olvidaste tu contraseña?</h2>
                                <p>
                                    Ingresa tu correo electrónico y te enviaremos
                                    instrucciones para restablecer tu contraseña
                                </p>
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

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`btn btn-primary ${styles.submitBtn}`}
                                >
                                    {loading ? (
                                        <>
                                            <span className={styles.spinner}></span>
                                            Enviando enlace...
                                        </>
                                    ) : (
                                        'Enviar Enlace de Recuperación'
                                    )}
                                </button>
                            </form>

                            <div className={styles.backToLogin}>
                                <Link href="/login" className={styles.backLink}>
                                    <span className={styles.backIcon}>←</span>
                                    Volver al inicio de sesión
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className={styles.successContainer}>
                            <div className={styles.successIconWrapper}>
                                <span className={styles.successIconLarge}>✉️</span>
                            </div>
                            <h2 className={styles.successTitle}>¡Correo Enviado!</h2>
                            <p className={styles.successText}>
                                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
                            </p>
                            <div className={styles.successInstructions}>
                                <h3>Próximos pasos:</h3>
                                <ol>
                                    <li>Revisa tu bandeja de entrada</li>
                                    <li>Haz clic en el enlace de recuperación</li>
                                    <li>Crea una nueva contraseña segura</li>
                                    <li>Inicia sesión con tu nueva contraseña</li>
                                </ol>
                            </div>
                            <div className={styles.successNote}>
                                <p>
                                    <strong>Nota:</strong> Si no recibes el correo en unos minutos,
                                    revisa tu carpeta de spam o correo no deseado.
                                </p>
                            </div>
                            <div className={styles.successActions}>
                                <button
                                    onClick={() => {
                                        setSuccess(false);
                                        setEmail('');
                                    }}
                                    className={`btn btn-outline ${styles.resendBtn}`}
                                >
                                    Reenviar correo
                                </button>
                                <Link href="/login" className="btn btn-primary">
                                    Ir al inicio de sesión
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
