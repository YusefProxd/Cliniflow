'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, RolUsuario } from '@/lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: RolUsuario[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Verificar si hay un usuario autenticado
                const { data: { user }, error } = await supabase.auth.getUser();

                if (error || !user) {
                    // No hay usuario, redirigir al login
                    console.log('No user found, redirecting to login');
                    router.push('/login');
                    return;
                }

                // Obtener el rol del usuario
                let userRole = user.user_metadata?.rol as RolUsuario;

                // Si no tiene rol, asignar 'paciente' por defecto
                if (!userRole) {
                    console.log('No role found, assigning default role: paciente');
                    userRole = 'paciente';

                    // Actualizar los metadatos del usuario
                    const { error: updateError } = await supabase.auth.updateUser({
                        data: { rol: 'paciente' }
                    });

                    if (updateError) {
                        console.error('Error updating user metadata:', updateError);
                    }
                }

                console.log('User role:', userRole, 'Allowed roles:', allowedRoles);

                // Verificar si el rol está permitido
                if (!allowedRoles.includes(userRole)) {
                    console.log('Role not allowed, redirecting to appropriate dashboard');
                    // Rol no autorizado, redirigir según el rol del usuario
                    switch (userRole) {
                        case 'admin':
                            router.push('/dashboard/admin');
                            break;
                        case 'doctor':
                            router.push('/dashboard/doctor');
                            break;
                        case 'paciente':
                            router.push('/dashboard/paciente');
                            break;
                        default:
                            router.push('/login');
                    }
                    return;
                }

                // Usuario autorizado
                console.log('User authorized, showing content');
                setIsAuthorized(true);
            } catch (err) {
                console.error('Error al verificar autenticación:', err);
                router.push('/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();

        // Escuchar cambios en el estado de autenticación
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_OUT') {
                router.push('/login');
            } else if (event === 'SIGNED_IN') {
                // Recargar la verificación cuando el usuario inicia sesión
                checkAuth();
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [router, allowedRoles]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #2C5F7C, #4A9B8E)',
                color: 'white',
                fontFamily: 'Inter, sans-serif'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem',
                        animation: 'pulse 1.5s ease-in-out infinite'
                    }}>
                        🏥
                    </div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                        Verificando acceso...
                    </h2>
                </div>
                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.5; transform: scale(1.1); }
                    }
                `}</style>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return <>{children}</>;
}
