'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { signOut, supabase } from '@/lib/supabase';
import styles from '../../dashboard.module.css';

type PagoRow = {
  id: string;
  usuario_id: string;
  moneda: string;
  monto: number;
  metodo: string;
  estado: 'pending_verification' | 'approved' | 'rejected' | string;
  codigo_operacion: string;
  voucher_url: string;
  fecha_cita: string | null;
  hora_cita: string | null;
  motivo: string | null;
  creado_en: string;
  usuario?: {
    email?: string | null;
    nombre_completo?: string | null;
  } | null;
};

export default function AdminPagosPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [pagos, setPagos] = useState<PagoRow[]>([]);
  const [loadingPagos, setLoadingPagos] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setLoadingUser(false);
    };

    getUser();
  }, []);

  const fetchPagos = async () => {
    setLoadingPagos(true);
    setPageError(null);

    const { data, error } = await supabase
      .from('pagos')
      .select(
        [
          'id',
          'usuario_id',
          'moneda',
          'monto',
          'metodo',
          'estado',
          'codigo_operacion',
          'voucher_url',
          'fecha_cita',
          'hora_cita',
          'motivo',
          'creado_en',
          'usuario:usuarios(email,nombre_completo)',
        ].join(',')
      )
      .order('creado_en', { ascending: false });

    if (error) {
      setPageError(error.message);
      setPagos([]);
      setLoadingPagos(false);
      return;
    }

    setPagos((data as any) ?? []);
    setLoadingPagos(false);
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const getVoucherPublicUrl = (voucherUrlOrPath: string) => {
    if (!voucherUrlOrPath) return null;
    if (/^https?:\/\//i.test(voucherUrlOrPath)) return voucherUrlOrPath;
    const { data } = supabase.storage.from('vouchers').getPublicUrl(voucherUrlOrPath);
    return data?.publicUrl || null;
  };

  const updatePagoEstado = async (pagoId: string, estado: 'approved' | 'rejected') => {
    setUpdatingId(pagoId);
    setPageError(null);

    const { data, error } = await supabase
      .from('pagos')
      .update({ estado })
      .eq('id', pagoId)
      .select(
        [
          'id',
          'usuario_id',
          'moneda',
          'monto',
          'metodo',
          'estado',
          'codigo_operacion',
          'voucher_url',
          'fecha_cita',
          'hora_cita',
          'motivo',
          'creado_en',
          'usuario:usuarios(email,nombre_completo)',
        ].join(',')
      )
      .single();

    if (error) {
      setPageError(error.message);
      setUpdatingId(null);
      return;
    }

    setPagos((prev) => prev.map((p) => (p.id === pagoId ? ((data as any) as PagoRow) : p)));
    setUpdatingId(null);
  };

  const stats = useMemo(() => {
    const pending = pagos.filter((p) => p.estado === 'pending_verification').length;
    const approved = pagos.filter((p) => p.estado === 'approved').length;
    const rejected = pagos.filter((p) => p.estado === 'rejected').length;
    return { pending, approved, rejected, total: pagos.length };
  }, [pagos]);

  if (loadingUser) {
    return <div>Cargando...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className={styles.dashboard}>
        <header className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <Link href="/dashboard/admin" className={styles.logoSection}>
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

        <main className={styles.main}>
          <div className="container">
            <div className={styles.welcomeSection}>
              <h1 className={styles.welcomeTitle}>Pagos (Yape) - Verificación</h1>
              <p className={styles.welcomeSubtitle}>
                Aprueba o rechaza pagos enviados por los pacientes.
              </p>
            </div>

            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div>
                    <div className={styles.statLabel}>Pendientes</div>
                    <div className={styles.statValue}>{stats.pending}</div>
                  </div>
                  <div className={styles.statIcon}>⏳</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div>
                    <div className={styles.statLabel}>Aprobados</div>
                    <div className={styles.statValue}>{stats.approved}</div>
                  </div>
                  <div className={styles.statIcon}>✅</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div>
                    <div className={styles.statLabel}>Rechazados</div>
                    <div className={styles.statValue}>{stats.rejected}</div>
                  </div>
                  <div className={styles.statIcon}>❌</div>
                </div>
              </div>

              <div className={styles.statCard}>
                <div className={styles.statHeader}>
                  <div>
                    <div className={styles.statLabel}>Total</div>
                    <div className={styles.statValue}>{stats.total}</div>
                  </div>
                  <div className={styles.statIcon}>💳</div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Lista de pagos</h2>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={fetchPagos}
                  disabled={loadingPagos || !!updatingId}
                >
                  {loadingPagos ? 'Cargando...' : 'Actualizar'}
                </button>
              </div>

              {pageError && (
                <div style={{
                  background: 'var(--error-light)',
                  color: 'var(--error-dark)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  fontWeight: 600,
                }}>
                  {pageError}
                </div>
              )}

              {loadingPagos ? (
                <div style={{ padding: '1rem', color: 'var(--gray-600)' }}>Cargando pagos...</div>
              ) : pagos.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>💸</div>
                  <p className={styles.emptyText}>No hay pagos registrados</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--gray-200)' }}>
                        <th style={{ padding: '0.75rem' }}>Fecha</th>
                        <th style={{ padding: '0.75rem' }}>Paciente</th>
                        <th style={{ padding: '0.75rem' }}>Monto</th>
                        <th style={{ padding: '0.75rem' }}>Operación</th>
                        <th style={{ padding: '0.75rem' }}>Estado</th>
                        <th style={{ padding: '0.75rem' }}>Voucher</th>
                        <th style={{ padding: '0.75rem' }}>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagos.map((p) => {
                        const voucherLink = getVoucherPublicUrl(p.voucher_url);
                        const isPending = p.estado === 'pending_verification';
                        const isUpdating = updatingId === p.id;

                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                            <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                              {new Date(p.creado_en).toLocaleString()}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <div style={{ fontWeight: 600 }}>{p.usuario?.nombre_completo || '—'}</div>
                              <div style={{ fontSize: '0.875rem', color: 'var(--gray-600)' }}>
                                {p.usuario?.email || p.usuario_id}
                              </div>
                            </td>
                            <td style={{ padding: '0.75rem', whiteSpace: 'nowrap', fontWeight: 600 }}>
                              {p.moneda === 'PEN' ? 'S/' : p.moneda} {Number(p.monto).toFixed(2)}
                            </td>
                            <td style={{ padding: '0.75rem', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas' }}>
                              {p.codigo_operacion}
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.5rem',
                                  borderRadius: '999px',
                                  fontSize: '0.875rem',
                                  fontWeight: 700,
                                  background:
                                    p.estado === 'approved'
                                      ? 'var(--success-light)'
                                      : p.estado === 'rejected'
                                        ? 'var(--error-light)'
                                        : 'var(--gray-100)',
                                  color:
                                    p.estado === 'approved'
                                      ? 'var(--success-dark)'
                                      : p.estado === 'rejected'
                                        ? 'var(--error-dark)'
                                        : 'var(--gray-700)',
                                }}
                              >
                                {p.estado}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem' }}>
                              {voucherLink ? (
                                <a
                                  href={voucherLink}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ color: 'var(--primary-600)', fontWeight: 700 }}
                                >
                                  Ver comprobante
                                </a>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                              <button
                                type="button"
                                className="btn btn-accent"
                                onClick={() => updatePagoEstado(p.id, 'approved')}
                                disabled={!isPending || isUpdating}
                                style={{ marginRight: '0.5rem' }}
                              >
                                {isUpdating ? 'Procesando...' : 'Aprobar'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() => updatePagoEstado(p.id, 'rejected')}
                                disabled={!isPending || isUpdating}
                              >
                                Rechazar
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
