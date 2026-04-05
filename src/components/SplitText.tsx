import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SplitText.module.css';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  children: string;
  as?: keyof React.JSX.IntrinsicElements;
  className?: string;
  delay?: number;
  stagger?: number;
  duration?: number;
  start?: string;
}

const SplitText: React.FC<SplitTextProps> = ({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  stagger = 0.03,
  duration = 0.8,
  start = 'top 85%',
}) => {
  const wrapperRef = useRef<HTMLElement>(null);

  const chars = children.split('').map((ch, i) => (
    <span key={i} className={styles.char}>
      {ch === ' ' ? '\u00A0' : ch}
    </span>
  ));

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const charEls = el.querySelectorAll(`.${styles.char}`);
    if (!charEls.length) return;

    gsap.set(charEls, { y: '100%', opacity: 0 });

    const tween = gsap.to(charEls, {
      y: '0%',
      opacity: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    });

    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [delay, stagger, duration, start]);

  // @ts-expect-error dynamic tag element
  return <Tag ref={wrapperRef} className={`${styles.wrapper} ${className}`}>{chars}</Tag>;
};

export default SplitText;
