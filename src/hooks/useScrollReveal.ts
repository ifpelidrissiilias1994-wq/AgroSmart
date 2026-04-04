import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RevealOptions {
  y?: number;
  x?: number;
  opacity?: number;
  duration?: number;
  delay?: number;
  stagger?: number;
  children?: boolean;
  scale?: number;
  start?: string;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const {
    y = 60, x = 0, opacity = 0, duration = 1, delay = 0,
    stagger = 0.15, children = false, scale = 1, start = 'top 85%',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const targets = children ? el.children : el;
    gsap.set(targets, { y, x, opacity, scale });
    const tween = gsap.to(targets, {
      y: 0, x: 0, opacity: 1, scale: 1,
      duration, delay,
      stagger: children ? stagger : 0,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start, toggleActions: 'play none none none' },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [ref, y, x, opacity, duration, delay, stagger, children, scale, start]);
}
