'use client';

import { useState } from 'react';
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';
import Header from "@/components/Header";
import { supabase } from '@/lib/supabase';
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingScheduleLabel, setPendingScheduleLabel] = useState<string | null>(null);

  const handleSchedule = async (label?: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setPendingScheduleLabel(label || null);
      setIsAuthModalOpen(true);
      return;
    }

    const query = label ? `?ref=${encodeURIComponent(label)}` : '';
    router.push(`/appointments${query}`);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Header />

      {/* Hero Section */}
      <section id="inicio" className={styles.hero}>
        <div className="container">
          <div className={styles.heroContent}>
            <div className={styles.heroText}>
              <h1 className="animate-fade-in">
                Tu Salud, Nuestra <span className={styles.highlight}>Prioridad</span>
              </h1>
              <p className="animate-fade-in">
                Atención médica profesional y personalizada con tecnología de vanguardia.
                Agenda tu consulta en minutos y accede a tu historial médico desde cualquier lugar.
              </p>
              <div className={styles.heroStats}>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>15,000+</div>
                  <div className={styles.statLabel}>Pacientes Atendidos</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>98%</div>
                  <div className={styles.statLabel}>Satisfacción</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statNumber}>25+</div>
                  <div className={styles.statLabel}>Años de Experiencia</div>
                </div>
              </div>
              <div className={styles.heroCta}>
                <button
                  type="button"
                  className="btn btn-accent"
                  onClick={() => handleSchedule('Consulta')}
                >
                  Agendar Consulta
                </button>
                <Link href="#servicios" className="btn btn-outline">
                  Ver Servicios
                </Link>
              </div>
            </div>
            <div className={styles.heroImage}>
              <div className={styles.heroImagePlaceholder}>
                <span className={styles.heroIcon}>🏥</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision, Values */}
      <section className={styles.mvvSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Nuestros Pilares</h2>
          <div className={styles.mvvGrid}>
            <div className="card">
              <div className={styles.mvvIcon}>🎯</div>
              <h3>Misión</h3>
              <p>
                Brindar atención médica de excelencia, accesible y personalizada,
                integrando tecnología innovadora para mejorar la calidad de vida
                de nuestros pacientes y sus familias.
              </p>
            </div>
            <div className="card">
              <div className={styles.mvvIcon}>🔭</div>
              <h3>Visión</h3>
              <p>
                Ser el centro médico de referencia en la región, reconocido por
                nuestra excelencia clínica, innovación tecnológica y compromiso
                con el bienestar integral de la comunidad.
              </p>
            </div>
            <div className="card">
              <div className={styles.mvvIcon}>💎</div>
              <h3>Valores</h3>
              <ul className={styles.valuesList}>
                <li>✓ Excelencia profesional</li>
                <li>✓ Empatía y humanidad</li>
                <li>✓ Innovación constante</li>
                <li>✓ Ética y transparencia</li>
                <li>✓ Trabajo en equipo</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="servicios" className={styles.servicesSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
          <p className={styles.sectionSubtitle}>
            Ofrecemos una amplia gama de servicios médicos especializados
          </p>
          <div className={styles.servicesGrid}>
            {services.map((service, index) => (
              <div key={index} className="card">
                <div className={styles.serviceIcon}>{service.icon}</div>
                <h3>{service.name}</h3>
                <p>{service.description}</p>
                <div className={styles.servicePrice}>
                  Desde S/ {service.price}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => handleSchedule(service.name)}
                >
                  Agendar
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section id="equipo" className={styles.teamSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Nuestro Equipo Médico</h2>
          <p className={styles.sectionSubtitle}>
            Profesionales altamente calificados comprometidos con tu salud
          </p>
          <div className={styles.teamGrid}>
            {doctors.map((doctor, index) => (
              <div key={index} className="card">
                <div className={styles.doctorAvatar}>{doctor.avatar}</div>
                <h3>{doctor.name}</h3>
                <div className={styles.doctorSpecialty}>{doctor.specialty}</div>
                <div className={styles.doctorInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📚</span>
                    <span>{doctor.education}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>⭐</span>
                    <span>{doctor.experience} años de experiencia</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🏆</span>
                    <span>{doctor.certifications}</span>
                  </div>
                </div>
                <p className={styles.doctorBio}>{doctor.bio}</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleSchedule(`Cita con ${doctor.name}`)}
                >
                  Agendar con {doctor.name.split(' ')[1]}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contacto" className={styles.contactSection}>
        <div className="container">
          <h2 className={styles.sectionTitle}>Contáctanos</h2>
          <div className={styles.contactGrid}>
            <div className={styles.contactInfo}>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>📞</div>
                <h3>Teléfono</h3>
                <p>+51 1 234 5678</p>
                <p>+51 987 654 321</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>✉️</div>
                <h3>Email</h3>
                <p>info@cliniflow.com</p>
                <p>citas@cliniflow.com</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>📍</div>
                <h3>Dirección</h3>
                <p>Av. Principal 123</p>
                <p>Lima, Perú</p>
              </div>
              <div className={styles.contactCard}>
                <div className={styles.contactIcon}>🕐</div>
                <h3>Horario</h3>
                <p>Lunes - Viernes: 8:00 - 20:00</p>
                <p>Sábados: 9:00 - 14:00</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <div className={styles.footerBrand}>
              <Image
                src="/logo.png"
                alt="CliniFlow Logo"
                width={40}
                height={40}
              />
              <span className={styles.footerBrandName}>CliniFlow</span>
              <p>Tu salud, nuestra prioridad</p>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerColumn}>
                <h4>Navegación</h4>
                <Link href="#inicio">Inicio</Link>
                <Link href="#servicios">Servicios</Link>
                <Link href="#equipo">Equipo</Link>
                <Link href="#contacto">Contacto</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4>Legal</h4>
                <Link href="/privacy">Privacidad</Link>
                <Link href="/terms">Términos</Link>
                <Link href="/cookies">Cookies</Link>
              </div>
              <div className={styles.footerColumn}>
                <h4>Redes Sociales</h4>
                <a href="#" target="_blank">Facebook</a>
                <a href="#" target="_blank">Instagram</a>
                <a href="#" target="_blank">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2024 CliniFlow. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>

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
              Para agendar{pendingScheduleLabel ? ` "${pendingScheduleLabel}"` : ''} debes iniciar sesión o registrarte.
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
                onClick={() => setIsAuthModalOpen(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample data
const services = [
  {
    icon: "🩺",
    name: "Consulta General",
    description: "Evaluación médica general y diagnóstico inicial",
    price: "80.00"
  },
  {
    icon: "❤️",
    name: "Cardiología",
    description: "Evaluación y tratamiento de enfermedades cardiovasculares",
    price: "150.00"
  },
  {
    icon: "👶",
    name: "Pediatría",
    description: "Atención médica especializada para niños y adolescentes",
    price: "100.00"
  },
  {
    icon: "🦴",
    name: "Traumatología",
    description: "Diagnóstico y tratamiento de lesiones musculoesqueléticas",
    price: "120.00"
  },
  {
    icon: "🧠",
    name: "Neurología",
    description: "Evaluación y tratamiento de trastornos del sistema nervioso",
    price: "180.00"
  },
  {
    icon: "🔬",
    name: "Análisis Clínicos",
    description: "Pruebas de laboratorio completas",
    price: "60.00"
  },
  {
    icon: "📷",
    name: "Radiología",
    description: "Estudios de imagen diagnóstica",
    price: "100.00"
  },
  {
    icon: "💉",
    name: "Vacunación",
    description: "Aplicación de vacunas preventivas",
    price: "40.00"
  },
  {
    icon: "💻",
    name: "Telemedicina",
    description: "Consulta médica virtual por videollamada",
    price: "60.00"
  }
];

const doctors = [
  {
    avatar: "👨‍⚕️",
    name: "Dr. Carlos Mendoza",
    specialty: "Cardiólogo",
    education: "Universidad Nacional Mayor de San Marcos",
    experience: 15,
    certifications: "Certificado por el Colegio Médico del Perú",
    bio: "Especialista en enfermedades cardiovasculares con amplia experiencia en diagnóstico y tratamiento de patologías cardíacas."
  },
  {
    avatar: "👩‍⚕️",
    name: "Dra. María González",
    specialty: "Pediatra",
    education: "Universidad Peruana Cayetano Heredia",
    experience: 12,
    certifications: "Maestría en Pediatría Clínica",
    bio: "Dedicada al cuidado integral de niños y adolescentes, con enfoque en medicina preventiva y desarrollo infantil."
  },
  {
    avatar: "👨‍⚕️",
    name: "Dr. Roberto Silva",
    specialty: "Traumatólogo",
    education: "Universidad de San Martín de Porres",
    experience: 18,
    certifications: "Especialista en Cirugía Ortopédica",
    bio: "Experto en tratamiento de lesiones deportivas y cirugía reconstructiva del sistema musculoesquelético."
  },
  {
    avatar: "👩‍⚕️",
    name: "Dra. Ana Torres",
    specialty: "Neuróloga",
    education: "Universidad Nacional de Trujillo",
    experience: 10,
    certifications: "Diplomado en Neurociencias",
    bio: "Especializada en trastornos neurológicos y enfermedades neurodegenerativas con enfoque en tratamientos innovadores."
  }
];
