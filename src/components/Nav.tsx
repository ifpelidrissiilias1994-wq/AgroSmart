import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Nav.module.css';

interface NavLink {
  label: string;
  href: string;
}

interface NavProps {
  activeLink?: string;
  links: NavLink[];
  user?: string;
  tag?: string;
  tagColor?: string;
  variant?: 'dark' | 'light';
  ctaLabel?: string;
  ctaHref?: string;
  onLogout?: () => void;
}

const Nav: React.FC<NavProps> = ({ activeLink, links, user, tag, tagColor, variant = 'dark', ctaLabel, ctaHref, onLogout }) => {
  const navClass = variant === 'light' ? `${styles.nav} ${styles.navLight}` : styles.nav;
  const navigate = useNavigate();

  return (
    <nav className={navClass}>
      <Link to={user ? '/parcelas' : '/'} className={`${styles.brand} ${variant === 'light' ? styles.brandLight : ''}`} style={{ textDecoration: 'none' }}>
        AgroSmart
      </Link>
      {tag && (
        <span
          className={`${styles.tag} ${variant === 'light' ? styles.tagLight : ''}`}
          style={tagColor ? { color: tagColor } : undefined}
        >
          {tag}
        </span>
      )}
      <div className={styles.spacer} />
      <ul className={styles.links}>
        {links.map((link) => (
          <li key={link.href}>
            <Link
              className={`${styles.link} ${variant === 'light' ? styles.linkLight : ''}${activeLink === link.href ? ` ${styles.linkActive}` : ''}`}
              to={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
      {ctaLabel && (
        <Link className={styles.cta} to={ctaHref || '#'}>
          {ctaLabel}
        </Link>
      )}
      {user && (
        <>
          <Link to="/account" className={styles.user} style={{ textDecoration: 'none' }}>{user}</Link>
          {onLogout && (
            <button className={styles.logoutBtn} onClick={() => { onLogout(); navigate('/'); }}>
              Salir
            </button>
          )}
        </>
      )}
    </nav>
  );
};

export default Nav;
