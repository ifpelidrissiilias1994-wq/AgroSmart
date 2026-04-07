import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styles from './LoadCurtain.module.css';

const LoadCurtain: React.FC = () => {
  const curtainRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => setVisible(false),
    });

    tl.to(logoRef.current, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 0.3);
    tl.to(tagRef.current, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0.5);
    tl.to({}, { duration: 0.6 });
    tl.to([logoRef.current, tagRef.current], { opacity: 0, duration: 0.3, ease: 'power2.in' });
    tl.to(curtainRef.current, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' });
  }, []);

  if (!visible) return null;

  return (
    <div ref={curtainRef} className={styles.curtain}>
      <div className={styles.content}>
        <div ref={logoRef} className={styles.logo}>AgroSmart</div>
        <div ref={tagRef} className={styles.tag}>andalucía</div>
      </div>
    </div>
  );
};

export default LoadCurtain;
