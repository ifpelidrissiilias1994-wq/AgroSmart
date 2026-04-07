import { useRef, useEffect, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import styles from './ScrollVideo.module.css';

gsap.registerPlugin(ScrollTrigger);

const FRAME_COUNT = 120;
const FRAME_PATH = '/frames/hero/frame-';

function frameSrc(index: number): string {
  const num = String(index + 1).padStart(3, '0');
  return `${FRAME_PATH}${num}.jpg`;
}

const ScrollVideo: React.FC = () => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const teaserOverlayRef = useRef<HTMLDivElement>(null);
  const h1Ref1 = useRef<HTMLHeadingElement>(null);
  const h1Ref2 = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const [firstFrameReady, setFirstFrameReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const drawFrame = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = imagesRef.current[index];
    if (!img || !img.complete || img.naturalWidth === 0) return;
    const cw = canvas.width, ch = canvas.height;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const sw = cw / scale, sh = ch / scale;
    const sx = (iw - sw) / 2, sy = (ih - sh) / 2;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    drawFrame(currentFrameRef.current);
  }, [drawFrame]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const images: HTMLImageElement[] = new Array(FRAME_COUNT);
    imagesRef.current = images;
    const first = new Image();
    first.src = frameSrc(0);
    first.onload = () => { images[0] = first; setFirstFrameReady(true); };
    for (let i = 1; i < FRAME_COUNT; i++) { const img = new Image(); img.src = frameSrc(i); images[i] = img; }
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || !firstFrameReady) return;
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [prefersReducedMotion, firstFrameReady, resizeCanvas]);

  useEffect(() => {
    if (firstFrameReady && !prefersReducedMotion) drawFrame(0);
  }, [firstFrameReady, prefersReducedMotion, drawFrame]);

  useGSAP(() => {
    if (prefersReducedMotion || !firstFrameReady) return;
    if (!wrapperRef.current || !canvasRef.current) return;

    ScrollTrigger.create({
      trigger: wrapperRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.5,
      onUpdate: (self) => {
        const newFrame = Math.min(FRAME_COUNT - 1, Math.floor(self.progress * FRAME_COUNT));
        if (newFrame !== currentFrameRef.current) {
          currentFrameRef.current = newFrame;
          drawFrame(newFrame);
        }
      },
    });

    if (heroOverlayRef.current) {
      gsap.fromTo(heroOverlayRef.current, { opacity: 1 }, {
        opacity: 0, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top top', end: '20% top', scrub: 0.5 },
      });
    }

    if (teaserOverlayRef.current) {
      gsap.fromTo(teaserOverlayRef.current, { opacity: 0 }, {
        opacity: 1, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: '80% bottom', end: 'bottom bottom', scrub: 0.5 },
      });
    }

    // Multi-layer parallax for hero text
    if (h1Ref1.current) {
      gsap.to(h1Ref1.current, {
        yPercent: -30, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top top', end: '30% top', scrub: 0.3 },
      });
    }
    if (h1Ref2.current) {
      gsap.to(h1Ref2.current, {
        yPercent: -50, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top top', end: '30% top', scrub: 0.3 },
      });
    }
    if (descRef.current) {
      gsap.to(descRef.current, {
        yPercent: -70, ease: 'none',
        scrollTrigger: { trigger: wrapperRef.current, start: 'top top', end: '30% top', scrub: 0.3 },
      });
    }
  }, { dependencies: [firstFrameReady, prefersReducedMotion], scope: wrapperRef });

  // ── Reduced motion fallback ──
  if (prefersReducedMotion) {
    return (
      <div className={styles.reduced}>
        {/* Fallback nav */}
        <div className={styles.fallbackNav}>
          <span className={styles.navLogo}>AgroSmart</span>
          <span className={styles.navTag}>andalucía</span>
          <span className={styles.navSpacer} />
          <a href="#" className={styles.navLink}>PRODUCTO</a>
          <a href="#" className={styles.navLink}>PRECIOS</a>
          <a href="#" className={styles.navLink}>CIENCIA</a>
          <a href="#" className={styles.navLink}>DEMO</a>
          <a href="/register" className={styles.navLinkGreen}>Prueba gratuita</a>
        </div>
        {/* Fallback hero */}
        <div className={styles.fallbackHero}>
          <div className={styles.fallbackTag}>A G R O S M A R T &nbsp; A N D A L U C Í A</div>
          <h1 className={styles.fallbackH1}><em>Agricultura,</em></h1>
          <h1 className={styles.fallbackH1}>Inteligente.</h1>
          <div className={styles.fallbackDesc}>Optimiza tus decisiones de cultivo con datos reales de AEMET, IGME y SISA.<br />Para tu finca. Para Andalucía.</div>
        </div>
        <img className={styles.reducedImg} src={frameSrc(0)} alt="Campo agrícola andaluz" />
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className={styles.wrapper} data-cursor="SCROLL">
      <div className={styles.sticky}>
        {/* Poster while loading */}
        {!firstFrameReady && (
          <img className={styles.poster} src={frameSrc(0)} alt="Campo agrícola andaluz" />
        )}

        {/* Canvas */}
        <canvas ref={canvasRef} className={styles.canvas} style={{ opacity: firstFrameReady ? 1 : 0 }} />

        {/* Nav overlay (always visible on video) */}
        <div className={styles.svNav}>
          <span className={styles.navLogoWhite}>AgroSmart</span>
          <span className={styles.navTagWhite}>andalucía</span>
          <span className={styles.navSpacer} />
          <a href="#producto" className={styles.navLinkWhite}>PRODUCTO</a>
          <a href="#precios" className={styles.navLinkWhite}>PRECIOS</a>
          <a href="#ciencia" className={styles.navLinkWhite}>CIENCIA</a>
          <a href="/register" className={styles.navLinkWhiteBold}>Prueba gratuita</a>
        </div>

        {/* Hero content overlay — fades out 0–20% */}
        <div ref={heroOverlayRef} className={styles.heroOverlay}>
          <h1 ref={h1Ref1} className={styles.svH1}><em>Agricultura,</em></h1>
          <h1 ref={h1Ref2} className={styles.svH1}>Inteligente.</h1>
          <div ref={descRef} className={styles.heroDesc}>Optimiza tus decisiones de cultivo con datos reales de AEMET, IGME y SISA.<br />Para tu finca. Para Andalucía.</div>
        </div>

        {/* Problem teaser overlay — fades in 80–100% */}
        <div ref={teaserOverlayRef} className={styles.teaserOverlay}>
          <span className={styles.teaserTag}>LA MAYORÍA DE FINCAS DECIDEN SIN DATOS</span>
          <div className={styles.teaserHeading}>¿ C u á n t o &nbsp; p o d r í a s<br />a h o r r a r ?</div>
          <div className={styles.teaserArrow}>&#8595;</div>
        </div>
      </div>
    </div>
  );
};

export default ScrollVideo;
