import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './HorizontalCards.module.css';

gsap.registerPlugin(ScrollTrigger);

interface Card {
  title: string;
  body: string;
}

interface HorizontalCardsProps {
  heading: string;
  cards: Card[];
}

const HorizontalCards: React.FC<HorizontalCardsProps> = ({ heading, cards }) => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const totalWidth = track.scrollWidth;
    const viewportWidth = window.innerWidth;
    const scrollDistance = totalWidth - viewportWidth + 128;

    section.style.height = `${scrollDistance + viewportWidth}px`;

    const tween = gsap.to(track, {
      x: -scrollDistance,
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${scrollDistance}`,
        pin: true,
        pinSpacing: true,
        scrub: 0.5,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [cards]);

  return (
    <div ref={sectionRef} className={styles.section}>
      <div className={styles.sticky}>
        <h2 className={styles.heading} dangerouslySetInnerHTML={{ __html: heading }} />
        <div ref={trackRef} className={styles.track}>
          {cards.map((card, i) => (
            <div key={i} className={styles.card}>
              <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
              <h3 className={styles.cardTitle} dangerouslySetInnerHTML={{ __html: card.title }} />
              <p className={styles.cardBody}>{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalCards;
