'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
    const router = useRouter();

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Obtener el usuario actual
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error) {
                    console.error('Error al obtener usuario:', error);
                    router.push('/login?error=auth_failed');
                    return;
                }

                if (user) {
                    // Crear perfil del usuario en la base de datos
                    try {
                        // Log para debug - ver qué datos trae Google
                        console.log('User metadata:', user.user_metadata);

                        const emailLower = (user.email || '').toLowerCase();
                        const adminEmails = ['2411010114@undc.edu.pe'];
                        const isAdminEmail = adminEmails.includes(emailLower);

                        const { data: existingUsuario } = await supabase
                            .from('usuarios')
                            .select('rol')
                            .eq('id', user.id)
                            .maybeSingle();

                        const finalRole = isAdminEmail
                            ? 'admin'
                            : (user.user_metadata?.rol as string) || existingUsuario?.rol || 'paciente';

                        // Extraer nombre completo de diferentes posibles campos de Google
                        const nombreCompleto =
                            user.user_metadata?.full_name ||
                            user.user_metadata?.name ||
                            (user.user_metadata?.given_name && user.user_metadata?.family_name
                                ? `${user.user_metadata.given_name} ${user.user_metadata.family_name}`
                                : null) ||
                            user.user_metadata?.given_name ||
                            user.user_metadata?.email?.split('@')[0] ||
                            user.email?.split('@')[0] ||
                            'Usuario';

                        const avatarUrl =
                            user.user_metadata?.url_avatar ||
                            user.user_metadata?.avatar_url ||
                            user.user_metadata?.picture ||
                            null;

                        console.log('Nombre extraído:', nombreCompleto);

                        const updatePayload: Record<string, any> = {
                            nombre_completo: nombreCompleto,
                            rol: finalRole,
                        };

                        if (avatarUrl) {
                            updatePayload.url_avatar = avatarUrl;
                        }

                        const { error: updateError } = await supabase.auth.updateUser({
                            data: updatePayload,
                        });

                        if (updateError) {
                            console.error('Error updating user metadata:', updateError);
                        }

                        const { data: profileData, error: profileError } = await supabase.rpc('create_user_profile', {
                            p_user_id: user.id,
                            p_email: user.email || '',
                            p_nombre_completo: nombreCompleto,
                            p_rol: finalRole,
                        });

                        if (profileError) {
                            console.error('Error creating profile:', profileError);
                        } else {
                            console.log('Profile created/updated:', profileData);
                        }
                    } catch (profileErr) {
                        console.error('Exception creating profile:', profileErr);
                    }

                    // Redirigir al home
                    router.push('/');
                } else {
                    router.push('/login');
                }
            } catch (err) {
                console.error('Error en callback:', err);
                router.push('/login?error=unexpected');
            }
        };

        handleCallback();
    }, [router]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #2C5F7C, #4A9B8E)',
            color: 'white',
            fontFamily: 'Inter, sans-serif'
        }}>
            <div style={{
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    fontSize: '4rem',
                    marginBottom: '1rem',
                    animation: 'spin 1s linear infinite'
                }}>
                    ⚕️
                </div>
                <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                    Completando autenticación...
                </h1>
                <p style={{ fontSize: '1.125rem', opacity: 0.9 }}>
                    Por favor espera mientras te redirigimos
                </p>
            </div>
            <style jsx>{`
                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }
            `}</style>
        </div>
    );
}
