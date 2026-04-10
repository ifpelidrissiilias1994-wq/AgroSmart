import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import styles from './FloatingOlives.module.css';

/**
 * Pure CSS/SVG floating olive elements — no WebGL required.
 * Subtle organic shapes that float and rotate in the hero section.
 */
const FloatingOlives: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const leaves = el.querySelectorAll(`.${styles.leaf}`);
    const olives = el.querySelectorAll(`.${styles.olive}`);

    leaves.forEach((leaf, i) => {
      gsap.to(leaf, {
        y: `${-15 - i * 5}px`,
        rotation: `${5 + i * 3}`,
        duration: 3 + i * 0.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.4,
      });
    });

    olives.forEach((olive, i) => {
      gsap.to(olive, {
        y: `${-10 - i * 4}px`,
        duration: 2.5 + i * 0.6,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
        delay: i * 0.3 + 0.5,
      });
    });
  }, []);

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Leaves */}
      <svg className={`${styles.leaf} ${styles.leaf1}`} viewBox="0 0 60 24" fill="none">
        <ellipse cx="30" cy="12" rx="28" ry="10" fill="#4a7c2f" opacity="0.7" />
        <line x1="4" y1="12" x2="56" y2="12" stroke="#3d6825" strokeWidth="0.8" />
      </svg>
      <svg className={`${styles.leaf} ${styles.leaf2}`} viewBox="0 0 50 20" fill="none">
        <ellipse cx="25" cy="10" rx="23" ry="8" fill="#5a8c3f" opacity="0.6" />
        <line x1="4" y1="10" x2="46" y2="10" stroke="#4a7c2f" strokeWidth="0.6" />
      </svg>
      <svg className={`${styles.leaf} ${styles.leaf3}`} viewBox="0 0 45 18" fill="none">
        <ellipse cx="22" cy="9" rx="20" ry="7" fill="#3d6825" opacity="0.5" />
        <line x1="4" y1="9" x2="40" y2="9" stroke="#2d5a1b" strokeWidth="0.6" />
      </svg>
      <svg className={`${styles.leaf} ${styles.leaf4}`} viewBox="0 0 55 22" fill="none">
        <ellipse cx="27" cy="11" rx="25" ry="9" fill="#4a7c2f" opacity="0.4" />
        <line x1="4" y1="11" x2="50" y2="11" stroke="#3d6825" strokeWidth="0.7" />
      </svg>

      {/* Olives */}
      <div className={`${styles.olive} ${styles.olive1}`} />
      <div className={`${styles.olive} ${styles.olive2}`} />
      <div className={`${styles.olive} ${styles.olive3}`} />
    </div>
  );
};

export default FloatingOlives;
