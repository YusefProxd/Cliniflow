'use client';

import Link from 'next/link';
import Image from 'next/image';
import UserProfile from './UserProfile';
import styles from './Header.module.css';

interface HeaderProps {
    showNav?: boolean;
}

export default function Header({ showNav = true }: HeaderProps) {
    return (
        <header className={styles.header}>
            <div className="container">
                <div className={styles.headerContent}>
                    <Link href="/" className={styles.logoLink}>
                        <Image
                            src="/logo.png"
                            alt="CliniFlow Logo"
                            width={50}
                            height={50}
                            className={styles.logo}
                        />
                        <span className={styles.brandName}>CliniFlow</span>
                    </Link>

                    {showNav && (
                        <nav className={styles.nav}>
                            <Link href="/#inicio">Inicio</Link>
                            <Link href="/#servicios">Servicios</Link>
                            <Link href="/#equipo">Equipo</Link>
                            <Link href="/#contacto">Contacto</Link>
                            <UserProfile />
                        </nav>
                    )}

                    {!showNav && (
                        <div className={styles.authOnly}>
                            <UserProfile />
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
