import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);
import DotButton from '../components/DotButton';
import GrainOverlay from '../components/GrainOverlay';
import LoadCurtain from '../components/LoadCurtain';
import CustomCursor from '../components/CustomCursor';
import ScrollVideo from '../components/ScrollVideo';
import { useCountUp } from '../hooks/useCountUp';
import { useParallax } from '../hooks/useParallax';
import { useScrollReveal } from '../hooks/useScrollReveal';
import SplitText from '../components/SplitText';
import SensorExploded from '../components/SensorExploded';
import styles from './LandingPage.module.css';

const LandingPage: React.FC = () => {
  // Problem section refs
  const problemRef = useRef<HTMLElement>(null);
  const problemImgRef = useRef<HTMLDivElement>(null);

  // Features section refs
  const betterRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  // Meet section refs
  const meetRef = useRef<HTMLElement>(null);
  const meetGridRef = useRef<HTMLDivElement>(null);

  // Stats section refs
  const statsRef = useRef<HTMLElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);

  // Planet section ref
  const planetRef = useRef<HTMLElement>(null);
  const planetImgRef = useRef<HTMLImageElement>(null);

  // Pricing section refs
  const pricingRef = useRef<HTMLElement>(null);
  const pricingGridRef = useRef<HTMLDivElement>(null);

  // CTA refs
  const ctaBgRef = useRef<HTMLImageElement>(null);
  const ctaContentRef = useRef<HTMLDivElement>(null);

  // Footer ref
  const footerRef = useRef<HTMLElement>(null);

  // Counter refs — problem stat
  const statCountRef = useRef<HTMLSpanElement>(null);
  const statDisplay = useCountUp(statCountRef, { end: 196000, duration: 2.5, separator: '.' });

  // Counter refs — stats section (all 4 count up)
  const stat1Ref = useRef<HTMLDivElement>(null);
  const stat2Ref = useRef<HTMLDivElement>(null);
  const stat3Ref = useRef<HTMLDivElement>(null);
  const stat4Ref = useRef<HTMLDivElement>(null);
  const stat1Display = useCountUp(stat1Ref, { end: 19.99, duration: 2, separator: '.', decimals: 2, suffix: '€' });
  const stat2Display = useCountUp(stat2Ref, { end: 5, duration: 1.5, separator: '.', suffix: '+' });
  const stat3Display = useCountUp(stat3Ref, { end: 70, duration: 2, separator: '.', suffix: '%' });
  const stat4Display = useCountUp(stat4Ref, { end: 30, duration: 1.8, separator: '.' });

  // Parallax
  useParallax(problemImgRef, -20);
  useParallax(planetImgRef, -15);
  useParallax(ctaBgRef, -10);

  // Scroll reveals
  useScrollReveal(problemRef, { y: 80, duration: 1.2 });
  useScrollReveal(problemImgRef, { x: 60, y: 0, duration: 1.4, delay: 0.2 });
  useScrollReveal(betterRef, { y: 60, duration: 1 });
  useScrollReveal(featuresRef, { y: 40, children: true, stagger: 0.2, duration: 0.8 });
  useScrollReveal(meetRef, { y: 50, duration: 1 });
  useScrollReveal(meetGridRef, { y: 40, scale: 0.97, children: true, stagger: 0.15, duration: 0.8 });
  useScrollReveal(statsRef, { y: 40, duration: 1 });
  useScrollReveal(statsGridRef, { y: 30, children: true, stagger: 0.12, duration: 0.8 });
  useScrollReveal(planetRef, { y: 60, children: true, stagger: 0.2, duration: 1.2 });
  useScrollReveal(pricingRef, { y: 50, duration: 1 });
  useScrollReveal(pricingGridRef, { y: 40, children: true, stagger: 0.2, duration: 0.9 });
  useScrollReveal(ctaContentRef, { y: 30, duration: 1.2 });
  useScrollReveal(footerRef, { y: 30, children: true, stagger: 0.1, duration: 0.8 });

  // Stats divider lines draw in
  useEffect(() => {
    const grid = statsGridRef.current;
    if (!grid) return;
    const trigger = ScrollTrigger.create({
      trigger: grid,
      start: 'top 80%',
      onEnter: () => {
        grid.querySelectorAll(':scope > *:not(:first-child)').forEach(el => el.classList.add('lineVisible'));
      },
    });
    return () => trigger.kill();
  }, []);

  // Clip-path reveal for planet image
  useEffect(() => {
    const img = planetImgRef.current;
    if (!img) return;
    const tween = gsap.to(img, {
      clipPath: 'inset(0% 0% 0% 0%)',
      ease: 'power2.out',
      scrollTrigger: { trigger: img, start: 'top 85%', end: 'top 40%', scrub: 0.5 },
    });
    return () => { tween.scrollTrigger?.kill(); tween.kill(); };
  }, []);

  return (
    <div>
      <LoadCurtain />
      <GrainOverlay />
      <CustomCursor />

      {/* ───── Scroll-Scrub Hero (nav + hero + video unified) ───── */}
      <ScrollVideo />

      {/* ───── Problem ───── */}
      <section ref={problemRef} className={styles.problem}>
        <div className={styles.problemLeft}>
          <span className={styles.problemTag}>LA MAYORÍA DE FINCAS DECIDEN SIN DATOS</span>
          <SplitText as="h2" className={styles.problemHeading} stagger={0.02} duration={0.6}>
            ¿Cuánto podrías ahorrar con datos reales?
          </SplitText>
          <p className={styles.problemBody}>
            El 70% de las explotaciones andaluzas son menores de 20 hectáreas. Sin acceso
            a tecnología asequible, las decisiones de riego, tratamiento y cosecha se basan
            en intuición — no en ciencia.
          </p>
          <span ref={statCountRef} className={styles.problemStat}>{statDisplay}</span>
          <span className={styles.problemStatLabel}>EXPLOTACIONES EN ANDALUCÍA</span>
        </div>
        <div ref={problemImgRef} className={styles.problemRight}>
          <img src="/images/olivos-problem.jpeg" alt="Olivos" />
        </div>
      </section>

      {/* ───── Better (Features) ───── */}
      <section ref={betterRef} className={styles.better} id="producto">
        <SplitText as="h2" className={styles.betterHeading} stagger={0.02} duration={0.6}>
          Datos reales, decisiones inteligentes
        </SplitText>
        <p className={styles.betterBody}>
          AgroSmart conecta fuentes de datos oficiales con inteligencia artificial para
          ofrecerte recomendaciones personalizadas — sin hardware adicional, desde 19,99€/mes.
        </p>
        <DotButton variant="outline" href="/register">EMPIEZA GRATIS</DotButton>

        <div ref={featuresRef}>
          <div className={styles.featureRow}>
            <div className={styles.featureDot} />
            <span className={styles.featureTitle}>AEMET + RIA integrados</span>
            <span className={styles.featureBody}>
              Datos meteorológicos en tiempo real de la Agencia Estatal y la Red de
              Información Agroclimática. ET0, precipitación, temperatura y humedad para tu zona exacta.
            </span>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureDot} />
            <span className={styles.featureTitle}>IGME + SISA conectados</span>
            <span className={styles.featureBody}>
              Análisis de suelo del Instituto Geológico y el Sistema de Información de Suelos.
              pH, textura, capacidad hídrica y riesgo de erosión de tu parcela.
            </span>
          </div>
          <div className={styles.featureRow}>
            <div className={styles.featureDot} />
            <span className={styles.featureTitle}>IA predictiva incluida</span>
            <span className={styles.featureBody}>
              Motor de inteligencia artificial que analiza tus datos históricos y genera
              recomendaciones de riego, tratamiento fitosanitario y ventana de cosecha con nivel de confianza.
            </span>
          </div>
        </div>
      </section>

      {/* ───── Meet (Card Grid) ───── */}
      <section ref={meetRef} className={styles.meet}>
        <SplitText as="h2" className={styles.meetHeading} stagger={0.015} duration={0.5}>
          Conoce AgroSmart
        </SplitText>
        <div ref={meetGridRef} className={styles.meetGrid}>
          <div className={styles.meetRow}>
            <div className={styles.meetCard}>
              <h3 className={styles.meetCardTitle}>E T 0 &nbsp; y &nbsp; E T c</h3>
              <p className={styles.meetCardBody}>
                Evapotranspiración de referencia y del cultivo calculada diariamente. Sabe
                exactamente cuánta agua necesitan tus plantas.
              </p>
            </div>
            <div className={styles.meetCard}>
              <h3 className={styles.meetCardTitle}>N D V I &nbsp; s a t é l i t e</h3>
              <p className={styles.meetCardBody}>
                Índice de vegetación por satélite para monitorizar la salud de tus cultivos
                sin pisar el campo. Actualización cada 5 días.
              </p>
            </div>
          </div>
          <div className={styles.meetRow}>
            <div className={styles.meetCard}>
              <h3 className={styles.meetCardTitle}>V P D &nbsp; y &nbsp; r i e s g o</h3>
              <p className={styles.meetCardBody}>
                Déficit de presión de vapor para detectar estrés hídrico y riesgo
                fitosanitario antes de que sea visible. Alertas automáticas por umbral.
              </p>
            </div>
            <div className={styles.meetCard}>
              <h3 className={styles.meetCardTitle}>R e c o m e n d a c i o n e s &nbsp; I A</h3>
              <p className={styles.meetCardBody}>
                Acciones semanales generadas por IA: cuándo regar, cuándo tratar, cuándo
                cosechar. Con nivel de confianza y fuente de datos trazable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── Sensor Exploded View (Parallax Assembly) ───── */}
      <SensorExploded />

      {/* ───── Stats (Dark) ───── */}
      <section ref={statsRef} className={styles.stats}>
        <SplitText as="h2" className={styles.statsHeading} stagger={0.015} duration={0.5}>
          Probado en campo
        </SplitText>
        <div ref={statsGridRef} className={styles.statsGrid}>
          <div className={styles.statCol}><div ref={stat1Ref} className={styles.statValue}>{stat1Display}</div><div className={styles.statLabel}>AL MES — SIN HARDWARE</div></div>
          <div className={styles.statCol}><div ref={stat2Ref} className={styles.statValue}>{stat2Display}</div><div className={styles.statLabel}>FUENTES DE DATOS OFICIALES</div></div>
          <div className={styles.statCol}><div ref={stat3Ref} className={styles.statValue}>{stat3Display}</div><div className={styles.statLabel}>FINCAS MENORES DE 20 HA</div></div>
          <div className={styles.statCol}><div ref={stat4Ref} className={styles.statValue}>{stat4Display}</div><div className={styles.statLabel}>DÍAS DE PRUEBA GRATUITA</div></div>
        </div>
      </section>

      {/* ───── Planet (Quote) ───── */}
      <section ref={planetRef} className={styles.planet} id="ciencia">
        <h2 className={styles.planetHeading}>P a r a &nbsp; t u &nbsp; f i n c a . &nbsp; P a r a &nbsp; A n d a l u c í a .</h2>
        <p className={styles.planetBody}>
          Una plataforma diseñada para el agricultor andaluz — con datos locales,
          en español, y a un precio que cabe en cualquier explotación.
        </p>
        <DotButton variant="outline" href="/register">EMPIEZA GRATIS</DotButton>
        <img ref={planetImgRef} className={styles.planetImage}
          src="https://images.unsplash.com/photo-1501004318855-cddc70ca1930?w=1440&h=400&fit=crop" alt="Olive grove" />
        <p className={styles.planetQuote}>
          &ldquo;Si me ahorra un solo tratamiento mal puesto al año, ya merece la pena.&rdquo;
        </p>
        <span className={styles.planetAuthor}>Antonio M., olivicultor, Jaén</span>
      </section>

      {/* ───── Pricing ───── */}
      <section ref={pricingRef} className={styles.pricing} id="precios">
        <h2 className={styles.pricingHeading}>E l i g e &nbsp; t u &nbsp; p l a n</h2>
        <div ref={pricingGridRef} className={styles.pricingGrid}>
          <div className={`${styles.planCard} ${styles.planBasic}`}>
            <span className={styles.planTag}>PLAN BÁSICO</span>
            <div className={styles.planPrice}>Gratuito</div>
            <div className={styles.planDesc}>Para empezar a conocer tus datos</div>
            <div className={styles.planFeat}>✓  Hasta 2 parcelas</div>
            <div className={styles.planFeat}>✓  Datos AEMET básicos</div>
            <div className={`${styles.planFeat} ${styles.planFeatOff}`}>✗  Sin IA ni recomendaciones</div>
            <div className={`${styles.planFeat} ${styles.planFeatOff}`}>✗  Sin alertas automáticas</div>
            <div className={`${styles.planFeat} ${styles.planFeatOff}`}>✗  Sin exportación de datos</div>
            <DotButton variant="outline" href="/register">EMPEZAR GRATIS</DotButton>
          </div>
          <div className={styles.planCard}>
            <span className={styles.planTag}>PLAN PREMIUM</span>
            <div className={styles.planPrice}>19,99 €/mes</div>
            <div className={styles.planDesc}>Todo lo que necesitas para optimizar tu finca</div>
            <div className={styles.planFeat}>✓  Parcelas ilimitadas</div>
            <div className={styles.planFeat}>✓  Datos completos AEMET + RIA + IGME + SISA</div>
            <div className={styles.planFeat}>✓  Motor IA con recomendaciones semanales</div>
            <div className={styles.planFeat}>✓  Alertas automáticas por VPD/NDVI</div>
            <div className={styles.planFeat}>✓  Exportación XLSX ilimitada</div>
            <div className={styles.planFeat}>✓  Bitácora de acciones completa</div>
            <div className={styles.planFeat}>✓  Soporte prioritario por email</div>
            <DotButton variant="primary" href="/register" dotColor="#4A7C2F">ACTIVAR PREMIUM</DotButton>
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className={styles.cta}>
        <img ref={ctaBgRef} className={styles.ctaBg} src="/images/cta-bg.jpeg" alt="" aria-hidden="true" />
        <div ref={ctaContentRef} className={styles.ctaContent}>
          <h2 className={styles.ctaHeading}>N o &nbsp; h a y &nbsp; m u c h a s &nbsp; o p o r t u n i d a d e s<br />d e &nbsp; s e r &nbsp; e l &nbsp; p r i m e r o .</h2>
          <h2 className={styles.ctaHeading}>D e &nbsp; l i d e r a r , &nbsp; n o &nbsp; s e g u i r .</h2>
          <p className={styles.ctaBody}>
            AgroSmart Andalucía está abierto para agricultores que quieren tomar decisiones
            basadas en datos reales. 30 días gratuitos, sin tarjeta de crédito.
          </p>
          <div className={styles.ctaButtons}>
            <a href="/register" className={styles.ctaBtn}><span className={styles.ctaDotGreen} /><span>PRUEBA GRATUITA</span><span className={styles.ctaDotGreen} /></a>
            <a href="#" className={styles.ctaBtn}><span className={styles.ctaDotBeige} /><span>CONTACTAR</span><span className={styles.ctaDotBeige} /></a>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer ref={footerRef} className={styles.footer}>
        <div className={styles.footerCol1}>
          <div className={styles.footerBrand}>AgroSmart</div>
          <span className={styles.footerTag}>Andalucía</span>
          <a className={styles.footerEmail} href="mailto:hola@agrosmart.es">hola@agrosmart.es</a>
          <div className={styles.footerCopy}>© 2026 AgroSmart Andalucía</div>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerColHead}>PRODUCTO</div>
          <a className={styles.footerLink} href="/parcelas">Dashboard</a>
          <a className={styles.footerLink} href="/parcelas">Parcelas</a>
          <a className={styles.footerLink} href="/historico">Histórico</a>
          <a className={styles.footerLink} href="#">IA Engine</a>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerColHead}>DATOS</div>
          <a className={styles.footerLink} href="#">AEMET</a>
          <a className={styles.footerLink} href="#">RIA</a>
          <a className={styles.footerLink} href="#">IGME</a>
          <a className={styles.footerLink} href="#">SISA / CAPDR</a>
        </div>
        <div className={styles.footerCol}>
          <div className={styles.footerColHead}>EMPRESA</div>
          <a className={styles.footerLink} href="#">Sobre nosotros</a>
          <a className={styles.footerLink} href="#">Inversores</a>
          <a className={styles.footerLink} href="#">Privacidad</a>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
