import { useEffect, useRef, useState, type RefObject } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CountUpOptions {
  end: number;
  duration?: number;
  separator?: string;
  decimals?: number;
  suffix?: string;
  start?: string;
}

export function useCountUp(
  ref: RefObject<HTMLElement | null>,
  options: CountUpOptions
): string {
  const { end, duration = 2, separator = '.', decimals = 0, suffix = '', start = 'top 80%' } = options;
  const [display, setDisplay] = useState('0');
  const triggered = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obj = { val: 0 };
    const trigger = ScrollTrigger.create({
      trigger: el,
      start,
      onEnter: () => {
        if (triggered.current) return;
        triggered.current = true;
        gsap.to(obj, {
          val: end,
          duration,
          ease: 'power2.out',
          onUpdate: () => {
            const v = decimals > 0 ? obj.val.toFixed(decimals) : Math.floor(obj.val).toString();
            const parts = v.split('.');
            parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
            setDisplay(parts.join(',') + suffix);
          },
        });
      },
    });
    return () => trigger.kill();
  }, [ref, end, duration, separator, decimals, suffix, start]);

  return display;
}
