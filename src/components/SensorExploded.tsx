import { useRef, useEffect, useState, useMemo, Suspense, createContext, useContext } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows } from '@react-three/drei';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import styles from './SensorExploded.module.css';

gsap.registerPlugin(ScrollTrigger);

/* ─── Part definitions ───
   explodedY  = GLB original position (spread 10 units for display)
   assembledY = compact device position (parts nest/overlap at interfaces)
   stagger    = delay before this part starts moving (0 = first, higher = later)
*/
interface PartInfo {
  groupName: string;
  label: string;
  sublabel: string;
  explodedY: number;
  assembledY: number;
  stagger: number;
}

const PARTS: PartInfo[] = [
  // Bottom → top order for stagger (stake moves first, cap last)
  // Assembled positions have 0.1-0.3 overlap at each interface for nesting
  { groupName: 'Part_Stake',      label: 'Estaca Base',           sublabel: 'Acero inox 316L, 40cm',          explodedY:  0.6, assembledY: 0.60, stagger: 0.00 },
  { groupName: 'Part_Moisture',   label: 'Sonda de Humedad',      sublabel: 'Capacitiva, 0-100% VWC',        explodedY:  2.0, assembledY: 2.55, stagger: 0.04 },
  { groupName: 'Part_Enclosure',  label: 'Caja Electrónica',      sublabel: 'IP67 MCU + radio + batería',    explodedY:  3.8, assembledY: 3.20, stagger: 0.08 },
  { groupName: 'Part_TempSensor', label: 'Sensor Temp / Humedad', sublabel: 'SHT31 ±0.3°C precisión',        explodedY:  5.6, assembledY: 4.05, stagger: 0.12 },
  { groupName: 'Part_Solar',      label: 'Panel Solar',           sublabel: '5V 1.2W policristalino',         explodedY:  7.2, assembledY: 4.45, stagger: 0.16 },
  { groupName: 'Part_Antenna',    label: 'Antena Inalámbrica',    sublabel: 'Transmisión LoRa 868 MHz',       explodedY:  8.8, assembledY: 4.55, stagger: 0.20 },
  { groupName: 'Part_Cap',        label: 'Protector Superior',    sublabel: 'Cúpula anti-lluvia translúcida', explodedY: 10.2, assembledY: 5.15, stagger: 0.24 },
];

// Reversed for label display (top to bottom)
const PARTS_DISPLAY = [...PARTS].reverse();

/* ─── Scroll context ─── */
const ScrollCtx = createContext<{ current: number }>(null!);

/* ═══════════════════════════════════════════
   3D Model — three-phase animation
   Phase 1 (0-10%):  Exploded, slow auto-rotate
   Phase 2 (10-40%): Staggered assembly
   Phase 3 (40-100%): Locked, camera orbits
   ═══════════════════════════════════════════ */
function SensorModel() {
  const gltf = useGLTF('/models/sensor_station.glb');
  const groupRef = useRef<THREE.Group>(null);
  const scrollRef = useContext(ScrollCtx);

  const partNodes = useMemo(() => {
    const result: { node: THREE.Object3D; info: PartInfo }[] = [];
    for (const info of PARTS) {
      const node = gltf.scene.getObjectByName(info.groupName);
      if (node) result.push({ node, info });
    }
    return result;
  }, [gltf.scene]);

  useFrame(() => {
    const scroll = scrollRef.current ?? 0;

    // Phase boundaries
    const PHASE1_END = 0.10;
    const PHASE2_END = 0.40;

    for (const { node, info } of partNodes) {
      if (scroll <= PHASE1_END) {
        // Phase 1: stay at exploded positions
        node.position.y = info.explodedY;
      } else if (scroll <= PHASE2_END) {
        // Phase 2: staggered assembly
        const phaseProgress = (scroll - PHASE1_END) / (PHASE2_END - PHASE1_END); // 0→1
        const partT = Math.max(0, Math.min(1, (phaseProgress - info.stagger) / (1 - info.stagger)));
        // Cubic ease-out
        const eased = 1 - Math.pow(1 - partT, 3);
        node.position.y = info.explodedY + (info.assembledY - info.explodedY) * eased;
      } else {
        // Phase 3: locked at assembled
        node.position.y = info.assembledY;
      }
    }

    // Auto-rotate only in Phase 1 (slow), stop during assembly & showcase
    if (groupRef.current) {
      if (scroll <= PHASE1_END) {
        groupRef.current.rotation.y += 0.002;
      }
      // Phase 3: no model rotation (camera orbits instead)
    }
  });

  return (
    <group ref={groupRef} position={[0, -4.0, 0]}>
      <primitive object={gltf.scene} />
    </group>
  );
}

/* ═══════════════════════════════════════════
   Camera — three-phase rig
   ═══════════════════════════════════════════ */
function CameraRig() {
  const { camera } = useThree();
  const scrollRef = useContext(ScrollCtx);
  const baseAngleRef = useRef(0);

  useFrame(() => {
    const scroll = scrollRef.current ?? 0;

    const PHASE1_END = 0.10;
    const PHASE2_END = 0.40;

    if (scroll <= PHASE1_END) {
      // Phase 1: static wide shot to see full exploded view
      camera.position.set(10.8, 2.5, 10.8);
      camera.lookAt(0, 0, 0);
      // Store the starting angle for Phase 3 orbit
      baseAngleRef.current = Math.atan2(10.8, 10.8);

    } else if (scroll <= PHASE2_END) {
      // Phase 2: dolly in as parts assemble
      const t = (scroll - PHASE1_END) / (PHASE2_END - PHASE1_END);
      const eased = 1 - Math.pow(1 - t, 2);
      const dist = THREE.MathUtils.lerp(15.3, 9, eased);
      const height = THREE.MathUtils.lerp(2.5, 1.0, eased);
      const lookY = THREE.MathUtils.lerp(0, -1.2, eased);
      camera.position.set(dist * 0.7, height, dist * 0.7);
      camera.lookAt(0, lookY, 0);
      baseAngleRef.current = Math.atan2(dist * 0.7, dist * 0.7);

    } else {
      // Phase 3: cinematic orbit around assembled device
      const orbitT = (scroll - PHASE2_END) / (1 - PHASE2_END); // 0→1
      const angle = baseAngleRef.current + orbitT * Math.PI * 1.5; // 270° arc
      const radius = THREE.MathUtils.lerp(9, 10.5, Math.sin(orbitT * Math.PI));
      const height = THREE.MathUtils.lerp(0.5, 3.0, 0.5 + 0.5 * Math.sin(orbitT * Math.PI * 2));
      camera.position.set(
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      );
      camera.lookAt(0, -1.2, 0);
    }
  });

  return null;
}

/* ═══════════════════════════════════════════
   Main wrapper
   ═══════════════════════════════════════════ */
const SensorExploded: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const progressFillRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);

  const scrollProgressRef = useRef(0);
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const container = containerRef.current;
    if (!section || !container) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        pin: container,
        pinSpacing: false,
      });

      // Header starts hidden, fades in at the end of scroll (Phase 3)
      if (headerRef.current) {
        gsap.fromTo(headerRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: '75% top', end: '90% top', scrub: 0.5 } });
      }

      // Labels: fade in during Phase 1, fade out during Phase 2
      labelsRef.current.forEach((label, i) => {
        if (!label) return;
        const inStart = 1 + i * 1.2;
        gsap.fromTo(label,
          { opacity: 0, x: i % 2 === 0 ? -20 : 20 },
          { opacity: 1, x: 0, ease: 'power2.out',
            scrollTrigger: { trigger: section, start: `${inStart}% top`, end: `${inStart + 4}% top`, scrub: 0.5 } });
        gsap.to(label,
          { opacity: 0, ease: 'power2.in',
            scrollTrigger: { trigger: section, start: '20% top', end: '35% top', scrub: 0.5 } });
      });

      // Progress bar
      if (progressFillRef.current) {
        gsap.fromTo(progressFillRef.current,
          { scaleY: 0 },
          { scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: section, start: 'top top', end: 'bottom bottom', scrub: 0.3 } });
      }

      // Scroll → ref + display state
      ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => {
          scrollProgressRef.current = self.progress;
          setDisplayProgress(Math.round(self.progress * 100));
        },
      });

      // Blueprint grid parallax
      const grid = container.querySelector(`.${styles.blueprintGrid}`) as HTMLElement;
      if (grid) {
        gsap.fromTo(grid,
          { backgroundPosition: '0 0' },
          { backgroundPosition: '0 -80px', ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // Status text matches the 3 phases
  const statusText = displayProgress < 10 ? 'VISTA EXPLOSIONADA'
    : displayProgress < 30 ? 'ENSAMBLANDO...'
    : displayProgress < 40 ? 'CASI LISTO'
    : displayProgress < 60 ? 'ENSAMBLADO ✓'
    : 'VISTA 360°';

  return (
    <div ref={sectionRef} className={styles.section} id="sensor">
      <div ref={containerRef} className={styles.container}>
        <div className={styles.blueprintGrid} />
        <div className={styles.blueprintVignette} />

        <div className={`${styles.cornerMark} ${styles.cornerTL}`} />
        <div className={`${styles.cornerMark} ${styles.cornerTR}`} />
        <div className={`${styles.cornerMark} ${styles.cornerBL}`} />
        <div className={`${styles.cornerMark} ${styles.cornerBR}`} />

        <div ref={headerRef} className={styles.header}>
          <span className={styles.tag}>HARDWARE · SMARTCROP STATION v2.1</span>
          <h2 ref={titleRef} className={styles.title}>Sensor de Campo</h2>
          <p ref={subtitleRef} className={styles.subtitle}>
            7 módulos de precisión. Un solo dispositivo.<br />
            Scroll para ensamblar.
          </p>
        </div>

        <div className={styles.canvasWrap}>
          <ScrollCtx.Provider value={scrollProgressRef}>
            <Canvas
              camera={{ position: [10.8, 2.5, 10.8], fov: 50, near: 0.1, far: 150 }}
              gl={{ antialias: true, alpha: true }}
              dpr={[1, 1.5]}
            >
              <color attach="background" args={['#1A1A14']} />
              <fog attach="fog" args={['#1A1A14', 18, 40]} />

              <ambientLight intensity={0.4} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} color="#fffbf0" />
              <directionalLight position={[-4, 3, -2]} intensity={0.5} color="#c8d8f0" />
              <pointLight position={[0, 2, 5]} intensity={0.6} color="#4A7C2F" distance={20} />

              <Suspense fallback={null}>
                <SensorModel />
                <ContactShadows position={[0, -5, 0]} opacity={0.3} scale={14} blur={2} far={10} />
                <Environment preset="studio" environmentIntensity={0.25} />
              </Suspense>

              <CameraRig />
            </Canvas>
          </ScrollCtx.Provider>
        </div>

        {/* Labels — display order top-to-bottom */}
        <div className={styles.labelsLayer}>
          {PARTS_DISPLAY.map((part, i) => (
            <div
              key={part.groupName}
              ref={el => { labelsRef.current[i] = el; }}
              className={`${styles.label} ${i % 2 === 0 ? styles.labelLeft : styles.labelRight}`}
            >
              <div className={styles.labelLine} />
              <div className={styles.labelContent}>
                <span className={styles.labelNumber}>{String(7 - i).padStart(2, '0')}</span>
                <span className={styles.labelName}>{part.label}</span>
                <span className={styles.labelDesc}>{part.sublabel}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.progressTrack}>
          <div ref={progressFillRef} className={styles.progressFill} />
          <div className={styles.progressDots}>
            {PARTS.map((_, i) => (
              <div key={i} className={`${styles.progressDot} ${displayProgress > (i + 1) * 12 ? styles.progressDotActive : ''}`} />
            ))}
          </div>
        </div>

        <div className={styles.statusBar}>
          <span className={styles.statusLabel}>{statusText}</span>
          <span className={styles.statusPercent}>{displayProgress}%</span>
        </div>

        <div className={styles.specsStrip}>
          <div className={styles.spec}><span className={styles.specValue}>IP67</span><span className={styles.specLabel}>PROTECCIÓN</span></div>
          <div className={styles.specDivider} />
          <div className={styles.spec}><span className={styles.specValue}>LoRa</span><span className={styles.specLabel}>CONECTIVIDAD</span></div>
          <div className={styles.specDivider} />
          <div className={styles.spec}><span className={styles.specValue}>Solar</span><span className={styles.specLabel}>ALIMENTACIÓN</span></div>
          <div className={styles.specDivider} />
          <div className={styles.spec}><span className={styles.specValue}>5 años</span><span className={styles.specLabel}>VIDA ÚTIL</span></div>
        </div>
      </div>
    </div>
  );
};

useGLTF.preload('/models/sensor_station.glb');
export default SensorExploded;
