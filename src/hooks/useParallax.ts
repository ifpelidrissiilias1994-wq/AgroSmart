import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function useParallax(
  ref: RefObject<HTMLElement | null>,
  speed: number = -30
) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = el.querySelector('img') || el;
    gsap.set(target, { yPercent: speed > 0 ? -speed : 0, scale: 1.15 });
    const tween = gsap.to(target, {
      yPercent: speed > 0 ? 0 : Math.abs(speed),
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, [ref, speed]);
}
