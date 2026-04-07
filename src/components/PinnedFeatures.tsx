import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './PinnedFeatures.module.css';

gsap.registerPlugin(ScrollTrigger);

interface Feature {
  title: string;
  body: string;
}

interface PinnedFeaturesProps {
  heading: string;
  description: string;
  features: Feature[];
  id?: string;
}

const PinnedFeatures: React.FC<PinnedFeaturesProps> = ({ heading, description, features, id }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const scrollPerFeature = window.innerHeight * 0.8;
    section.style.height = `${features.length * scrollPerFeature + window.innerHeight}px`;

    const triggers: ScrollTrigger[] = [];

    features.forEach((_, i) => {
      const el = featureRefs.current[i];
      if (!el) return;

      const start = i * scrollPerFeature;
      const end = start + scrollPerFeature;

      const tweenIn = gsap.fromTo(el,
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.5, ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: `${start}px top`,
            toggleActions: 'play none none reverse',
            onEnter: () => setActiveIndex(i),
            onEnterBack: () => setActiveIndex(i),
          },
        }
      );

      if (i < features.length - 1) {
        const tweenOut = gsap.to(el, {
          opacity: 0, y: -30, duration: 0.5, ease: 'power2.in',
          scrollTrigger: {
            trigger: section,
            start: `${end - 100}px top`,
            toggleActions: 'play none none reverse',
          },
        });
        if (tweenOut.scrollTrigger) triggers.push(tweenOut.scrollTrigger);
      }

      if (tweenIn.scrollTrigger) triggers.push(tweenIn.scrollTrigger);
    });

    const pinTrigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: 'bottom bottom',
      pin: `.${styles.sticky}`,
      pinSpacing: false,
    });
    triggers.push(pinTrigger);

    return () => triggers.forEach(t => t.kill());
  }, [features]);

  return (
    <div ref={sectionRef} className={styles.section} id={id}>
      <div className={styles.sticky}>
        <h2 className={styles.heading} dangerouslySetInnerHTML={{ __html: heading }} />
        <p className={styles.body}>{description}</p>
        <div className={styles.featureSlot}>
          {features.map((f, i) => (
            <div
              key={i}
              ref={el => { featureRefs.current[i] = el; }}
              className={styles.feature}
            >
              <div className={styles.featureDot} />
              <span className={styles.featureTitle}>{f.title}</span>
              <span className={styles.featureBody}>{f.body}</span>
            </div>
          ))}
        </div>
        <div className={styles.progress}>
          {features.map((_, i) => (
            <div key={i} className={`${styles.dot} ${i === activeIndex ? styles.dotActive : ''}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PinnedFeatures;
