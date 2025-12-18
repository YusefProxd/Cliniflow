'use client';


import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import styles from './appointments.module.css';

import yapeQrImage from '../../imagen/yapeQR.jpeg';

const YAPE_RECEIVER_NAME = 'CliniFlow';
const YAPE_PHONE = '+51 981 942 226';

type Servicio = {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  duracion_minutos: number | null;
  icono: string | null;
};

const fallbackServices: Servicio[] = [
  {
    id: 'consulta-general',
    nombre: 'Consulta General',
    descripcion: 'Evaluación médica general y diagnóstico inicial',
    precio: 80,
    duracion_minutos: 30,
    icono: '🩺',
  },
  {
    id: 'cardiologia',
    nombre: 'Cardiología',
    descripcion: 'Evaluación y tratamiento de enfermedades cardiovasculares',
    precio: 150,
    duracion_minutos: 45,
    icono: '❤️',
  },
  {
    id: 'pediatria',
    nombre: 'Pediatría',
    descripcion: 'Atención médica especializada para niños y adolescentes',
    precio: 100,
    duracion_minutos: 30,
    icono: '👶',
  },
];

export default function AppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  const [services, setServices] = useState<Servicio[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('');
  const [motivo, setMotivo] = useState('');

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isYapeModalOpen, setIsYapeModalOpen] = useState(false);
  const [codigoOperacion, setCodigoOperacion] = useState('');
  const [voucherFile, setVoucherFile] = useState<File | null>(null);
  const [voucherPreviewUrl, setVoucherPreviewUrl] = useState<string | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const ref = searchParams.get('ref');

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setUserLoading(false);

      if (!user) {
        setIsAuthModalOpen(true);
      }
    };

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUser(session?.user || null);
        setIsAuthModalOpen(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthModalOpen(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadServices = async () => {
      setServicesLoading(true);

      const { data, error } = await supabase
        .from('servicios')
        .select('id, nombre, descripcion, precio, duracion_minutos, icono')
        .eq('activo', true)
        .order('nombre', { ascending: true });

      if (error || !data || data.length === 0) {
        setServices(fallbackServices);
        setServicesLoading(false);
        return;
      }

      setServices(data as Servicio[]);
      setServicesLoading(false);
    };

    loadServices();
  }, []);

  const selectedService = useMemo(() => {
    if (!selectedServiceId) return null;
    return services.find((s) => s.id === selectedServiceId) || null;
  }, [selectedServiceId, services]);

  useEffect(() => {
    if (services.length === 0) return;

    if (selectedServiceId) return;

    const normalizedRef = (ref || '').trim().toLowerCase();

    if (normalizedRef) {
      const exact = services.find((s) => s.nombre.toLowerCase() === normalizedRef);
      if (exact) {
        setSelectedServiceId(exact.id);
        return;
      }

      const contains = services.find((s) => normalizedRef.includes(s.nombre.toLowerCase()));
      if (contains) {
        setSelectedServiceId(contains.id);
        return;
      }

      const partial = services.find((s) => s.nombre.toLowerCase().includes(normalizedRef));
      if (partial) {
        setSelectedServiceId(partial.id);
        return;
      }

      if (normalizedRef.includes('consulta')) {
        const consulta = services.find((s) => s.nombre.toLowerCase().includes('consulta'));
        if (consulta) {
          setSelectedServiceId(consulta.id);
          return;
        }
      }
    }

    setSelectedServiceId(services[0].id);
  }, [ref, services, selectedServiceId]);

  const isUuid = (value: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
  };

  const openYape = async () => {
    setSuccessMessage(null);
    setPaymentError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!selectedService) {
      return;
    }

    setCodigoOperacion('');
    setVoucherFile(null);
    setVoucherPreviewUrl(null);
    setIsYapeModalOpen(true);
  };

  const submitYapePayment = async () => {
    setPaymentError(null);
    setSuccessMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setIsAuthModalOpen(true);
      setIsYapeModalOpen(false);
      return;
    }

    if (!selectedService) {
      setPaymentError('Selecciona un servicio antes de pagar.');
      return;
    }

    const codigoDigits = codigoOperacion.replace(/\D/g, '');

    if (!codigoDigits) {
      setPaymentError('Ingresa el código de operación de Yape (8 dígitos).');
      return;
    }

    if (codigoDigits.length !== 8) {
      if (codigoDigits.length < 8) {
        setPaymentError(`El código de operación debe tener 8 dígitos. Faltan ${8 - codigoDigits.length} dígitos.`);
      } else {
        setPaymentError(`El código de operación debe tener 8 dígitos. Sobran ${codigoDigits.length - 8} dígitos.`);
      }
      return;
    }

    if (!voucherFile) {
      setPaymentError('Sube el comprobante de pago (imagen).');
      return;
    }

    setIsSubmittingPayment(true);

    try {
      let voucherUrl: string | null = null;

      const fileExt = voucherFile.name.split('.').pop() || 'png';
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase
        .storage
        .from('vouchers')
        .upload(filePath, voucherFile, { upsert: false });

      if (uploadError) {
        const details = (uploadError as any)?.message || String(uploadError);
        setPaymentError(
          `No se pudo subir el comprobante. Detalle: ${details}. ` +
          'Verifica que exista el bucket "vouchers" y que sus policies permitan INSERT para usuarios autenticados.'
        );
        return;
      }

      const { data: publicData } = supabase
        .storage
        .from('vouchers')
        .getPublicUrl(filePath);

      voucherUrl = publicData?.publicUrl || filePath;

      const monto = Number(selectedService.precio ?? 0);

      const insertPayload: Record<string, any> = {
        usuario_id: user.id,
        servicio_id: isUuid(selectedService.id) ? selectedService.id : null,
        moneda: 'PEN',
        monto,
        metodo: 'yape',
        estado: 'pending_verification',
        codigo_operacion: codigoDigits,
        voucher_url: voucherUrl,
        fecha_cita: fecha || null,
        hora_cita: hora || null,
        motivo: motivo || null,
      };

      const { error: insertError } = await supabase.from('pagos').insert(insertPayload);

      if (insertError) {
        setPaymentError('No se pudo registrar el pago. Verifica que la tabla "pagos" exista y que RLS permita INSERT.');
        return;
      }

      setIsYapeModalOpen(false);
      setSuccessMessage('Pago enviado para verificación. Te confirmaremos cuando sea aprobado.');
      setCodigoOperacion('');
      setVoucherFile(null);
      setVoucherPreviewUrl(null);

      setTimeout(() => {
        router.refresh();
      }, 200);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  useEffect(() => {
    if (!voucherFile) {
      setVoucherPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(voucherFile);
    setVoucherPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [voucherFile]);

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <div className="container">
          <div className={styles.headerRow}>
            <h1 className={styles.title}>Agendar cita</h1>
            <Link href="/" className={styles.backLink}>Volver al inicio</Link>
          </div>

          <div className={styles.grid}>
            <section className={styles.servicesPanel}>
              <div className={styles.panelTitle}>Servicios</div>

              {servicesLoading ? (
                <div className={styles.loading}>Cargando servicios...</div>
              ) : (
                <div className={styles.servicesList}>
                  {services.map((service) => {
                    const isSelected = service.id === selectedServiceId;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        className={`${styles.serviceItem} ${isSelected ? styles.serviceItemSelected : ''}`}
                        onClick={() => setSelectedServiceId(service.id)}
                      >
                        <div className={styles.serviceItemLeft}>
                          <div className={styles.serviceIcon}>{service.icono || '🩺'}</div>
                          <div>
                            <div className={styles.serviceName}>{service.nombre}</div>
                            <div className={styles.serviceMeta}>
                              {service.duracion_minutos ? `${service.duracion_minutos} min` : 'Duración variable'}
                            </div>
                          </div>
                        </div>
                        <div className={styles.servicePrice}>
                          S/ {Number(service.precio ?? 0).toFixed(2)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <section className={styles.detailsPanel}>
              <div className={styles.panelTitle}>Detalles</div>

              {!selectedService ? (
                <div className={styles.empty}>Selecciona un servicio para ver detalles.</div>
              ) : (
                <div className={styles.detailsCard}>
                  <div className={styles.detailsHeader}>
                    <div>
                      <div className={styles.detailsName}>{selectedService.nombre}</div>
                      <div className={styles.detailsDesc}>{selectedService.descripcion || 'Sin descripción'}</div>
                    </div>
                    <div className={styles.detailsPrice}>
                      S/ {Number(selectedService.precio ?? 0).toFixed(2)}
                    </div>
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.field}>
                      <label className={styles.label}>Fecha</label>
                      <input
                        className={styles.input}
                        type="date"
                        value={fecha}
                        onChange={(e) => setFecha(e.target.value)}
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label}>Hora</label>
                      <input
                        className={styles.input}
                        type="time"
                        value={hora}
                        onChange={(e) => setHora(e.target.value)}
                      />
                    </div>
                    <div className={styles.fieldFull}>
                      <label className={styles.label}>Motivo (opcional)</label>
                      <textarea
                        className={styles.textarea}
                        value={motivo}
                        onChange={(e) => setMotivo(e.target.value)}
                        placeholder="Ej: Dolor de cabeza, chequeo, etc."
                        rows={4}
                      />
                    </div>
                  </div>

                  <div className={styles.summaryRow}>
                    <div className={styles.summaryText}>
                      <div className={styles.summaryTitle}>Precio establecido</div>
                      <div className={styles.summaryValue}>S/ {Number(selectedService.precio ?? 0).toFixed(2)}</div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-accent"
                      onClick={openYape}
                      disabled={servicesLoading || userLoading}
                    >
                      Pagar con Yape
                    </button>
                  </div>

                  {successMessage && (
                    <div className={styles.success}>{successMessage}</div>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {isAuthModalOpen && (
        <div
          className={styles.authModalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <div className={styles.authModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.authModalTitle}>Necesitas una cuenta</h3>
            <p className={styles.authModalText}>
              Para agendar una cita debes iniciar sesión o registrarte.
            </p>
            <div className={styles.authModalActions}>
              <Link
                href="/login"
                className="btn btn-primary"
                onClick={() => setIsAuthModalOpen(false)}
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="btn btn-outline"
                onClick={() => setIsAuthModalOpen(false)}
              >
                Registrarse
              </Link>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsAuthModalOpen(false);
                  router.push('/');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {isYapeModalOpen && selectedService && (
        <div
          className={styles.yapeModalOverlay}
          role="dialog"
          aria-modal="true"
          onClick={() => setIsYapeModalOpen(false)}
        >
          <div className={styles.yapeModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.yapeTitle}>Pagar con Yape (simulado)</h3>

            <div className={styles.yapeGrid}>
              <div className={styles.yapeQrCard}>
                <div className={styles.yapeQrTitle}>Escanea el QR en Yape</div>
                <Image
                  className={styles.yapeQrImage}
                  alt="QR de Yape"
                  src={yapeQrImage}
                  width={240}
                  height={240}
                />
                <div className={styles.yapeReceiver}>
                  <div><strong>Receptor:</strong> {YAPE_RECEIVER_NAME}</div>
                  <div><strong>Yape:</strong> {YAPE_PHONE}</div>
                  <div className={styles.yapeAmount}><strong>Monto:</strong> S/ {Number(selectedService.precio ?? 0).toFixed(2)}</div>
                </div>
                <div className={styles.yapeHint}>
                  Paga el monto exacto y luego sube tu comprobante.
                </div>
              </div>

              <div className={styles.yapeFormCard}>
                <div className={styles.yapeField}>
                  <label className={styles.yapeLabel}>Código de operación</label>
                  <input
                    className={styles.yapeInput}
                    value={codigoOperacion}
                    inputMode="numeric"
                    onChange={(e) => setCodigoOperacion(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ej: 12345678"
                  />
                </div>

                <div className={styles.yapeField}>
                  <label className={styles.yapeLabel}>Comprobante (imagen)</label>
                  <input
                    className={styles.yapeFile}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setVoucherFile(e.target.files?.[0] || null)}
                  />

                  {voucherPreviewUrl && (
                    <div className={styles.voucherPreview}>
                      <img src={voucherPreviewUrl} alt="Vista previa del comprobante" />
                    </div>
                  )}
                </div>

                {paymentError && (
                  <div className={styles.paymentError}>{paymentError}</div>
                )}

                <div className={styles.yapeActions}>
                  <button
                    type="button"
                    className="btn btn-accent"
                    onClick={submitYapePayment}
                    disabled={isSubmittingPayment}
                  >
                    {isSubmittingPayment ? 'Enviando...' : 'Enviar comprobante'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setIsYapeModalOpen(false)}
                    disabled={isSubmittingPayment}
                  >
                    Cerrar
                  </button>
                </div>

                <div className={styles.yapeFooterNote}>
                  Tu pago quedará en <strong>verificación</strong> hasta que sea aprobado.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
