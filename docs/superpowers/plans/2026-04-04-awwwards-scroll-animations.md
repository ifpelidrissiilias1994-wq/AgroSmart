# Awwwards-Level Scroll Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the AgroSmart landing page to Awwwards quality by adding Lenis smooth scroll, GSAP scroll-triggered reveal animations on every section, stat counter animations, parallax images, grain texture, and text-split reveals.

**Architecture:** Install Lenis for smooth scrolling (wraps native scroll, GSAP-compatible). Build a reusable `useScrollReveal` hook wrapping GSAP ScrollTrigger. Add a `GrainOverlay` component for film grain. All animations are CSS + GSAP — no heavy libraries. Each section gets its own ScrollTrigger entrance animation orchestrated from `LandingPage.tsx`.

**Tech Stack:** React 19, GSAP 3.14 + ScrollTrigger (already installed), Lenis (new), CSS modules (existing)

---

### Task 1: Install Lenis Smooth Scroll

**Files:**
- Modify: `package.json` (add lenis dependency)
- Create: `src/components/SmoothScroll.tsx`
- Modify: `src/App.tsx` (wrap with SmoothScroll)

- [ ] **Step 1: Install Lenis**

Run: `cd c:/Users/ifpel/Downloads/SmartCrop-main/agrosmart-app && npm install lenis`

- [ ] **Step 2: Create SmoothScroll wrapper component**

Create `src/components/SmoothScroll.tsx`:

```tsx
import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const SmoothScroll: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
```

- [ ] **Step 3: Wrap App with SmoothScroll**

Modify `src/App.tsx` — add `<SmoothScroll>` inside `<AuthProvider>`, wrapping `<Routes>`:

```tsx
import SmoothScroll from './components/SmoothScroll';

// Inside the return:
<AuthProvider>
  <SmoothScroll>
    <Routes>
      {/* ... all routes ... */}
    </Routes>
  </SmoothScroll>
</AuthProvider>
```

- [ ] **Step 4: Add Lenis base CSS**

Add to `src/styles/tokens.css` at the end:

```css
html.lenis, html.lenis body {
  height: auto;
}
.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.lenis.lenis-stopped {
  overflow: hidden;
}
```

- [ ] **Step 5: Verify smooth scroll works**

Run: `npm run dev`
Open http://localhost:5174 — scroll should feel buttery smooth with momentum/inertia.

- [ ] **Step 6: Commit**

```bash
git add src/components/SmoothScroll.tsx src/App.tsx src/styles/tokens.css package.json package-lock.json
git commit -m "feat: add Lenis smooth scroll for Awwwards-quality scrolling"
```

---

### Task 2: Create GrainOverlay Component

**Files:**
- Create: `src/components/GrainOverlay.tsx`
- Create: `src/components/GrainOverlay.module.css`
- Modify: `src/pages/LandingPage.tsx` (add GrainOverlay)

- [ ] **Step 1: Create GrainOverlay CSS**

Create `src/components/GrainOverlay.module.css`:

```css
.grain {
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 256px 256px;
  mix-blend-mode: multiply;
}

@keyframes grainShift {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-2%, -3%); }
  20% { transform: translate(3%, 1%); }
  30% { transform: translate(-1%, 2%); }
  40% { transform: translate(2%, -2%); }
  50% { transform: translate(-3%, 3%); }
  60% { transform: translate(1%, -1%); }
  70% { transform: translate(-2%, 2%); }
  80% { transform: translate(3%, -3%); }
  90% { transform: translate(-1%, 1%); }
}

.grainAnimated {
  composes: grain;
  animation: grainShift 8s steps(10) infinite;
}
```

- [ ] **Step 2: Create GrainOverlay component**

Create `src/components/GrainOverlay.tsx`:

```tsx
import styles from './GrainOverlay.module.css';

const GrainOverlay: React.FC = () => <div className={styles.grainAnimated} />;

export default GrainOverlay;
```

- [ ] **Step 3: Add GrainOverlay to LandingPage**

Modify `src/pages/LandingPage.tsx` — add at the very top inside the root `<div>`:

```tsx
import GrainOverlay from '../components/GrainOverlay';

// Inside return, first child:
<div>
  <GrainOverlay />
  <ScrollVideo />
  {/* ... rest ... */}
</div>
```

- [ ] **Step 4: Verify grain texture visible**

Reload page — subtle organic grain/noise should overlay the entire page. Should be barely noticeable but add tactile warmth.

- [ ] **Step 5: Commit**

```bash
git add src/components/GrainOverlay.tsx src/components/GrainOverlay.module.css src/pages/LandingPage.tsx
git commit -m "feat: add film grain texture overlay for organic feel"
```

---

### Task 3: Scroll-Triggered Reveal Animations for All Sections

**Files:**
- Create: `src/hooks/useScrollReveal.ts`
- Modify: `src/pages/LandingPage.tsx` (add refs + useScrollReveal calls)
- Modify: `src/pages/LandingPage.module.css` (add initial hidden states)

- [ ] **Step 1: Create useScrollReveal hook**

Create `src/hooks/useScrollReveal.ts`:

```ts
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
  children?: boolean;  // animate direct children with stagger
  scale?: number;
  start?: string;
}

export function useScrollReveal(
  ref: RefObject<HTMLElement | null>,
  options: RevealOptions = {}
) {
  const {
    y = 60,
    x = 0,
    opacity = 0,
    duration = 1,
    delay = 0,
    stagger = 0.15,
    children = false,
    scale = 1,
    start = 'top 85%',
  } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = children ? el.children : el;

    gsap.set(targets, { y, x, opacity, scale });

    const tween = gsap.to(targets, {
      y: 0,
      x: 0,
      opacity: 1,
      scale: 1,
      duration,
      delay,
      stagger: children ? stagger : 0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, y, x, opacity, duration, delay, stagger, children, scale, start]);
}
```

- [ ] **Step 2: Add refs and reveal hooks to LandingPage**

Modify `src/pages/LandingPage.tsx` — add refs to every section and call useScrollReveal:

```tsx
import { useRef } from 'react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const LandingPage: React.FC = () => {
  // Section refs
  const problemRef = useRef<HTMLElement>(null);
  const problemImgRef = useRef<HTMLDivElement>(null);
  const betterRef = useRef<HTMLElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const meetRef = useRef<HTMLElement>(null);
  const meetGridRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLElement>(null);
  const statsGridRef = useRef<HTMLDivElement>(null);
  const planetRef = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const pricingGridRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const footerRef = useRef<HTMLElement>(null);

  // Problem section: text slides up, image slides in from right
  useScrollReveal(problemRef, { y: 80, duration: 1.2 });
  useScrollReveal(problemImgRef, { x: 60, y: 0, duration: 1.4, delay: 0.2 });

  // Features section: heading + body slide up, then feature rows stagger in
  useScrollReveal(betterRef, { y: 60, duration: 1 });
  useScrollReveal(featuresRef, { y: 40, children: true, stagger: 0.2, duration: 0.8 });

  // Meet cards: stagger in from bottom
  useScrollReveal(meetRef, { y: 50, duration: 1 });
  useScrollReveal(meetGridRef, { y: 40, scale: 0.97, children: true, stagger: 0.15, duration: 0.8 });

  // Stats: slide up with stagger
  useScrollReveal(statsRef, { y: 40, duration: 1 });
  useScrollReveal(statsGridRef, { y: 30, children: true, stagger: 0.12, duration: 0.8 });

  // Planet/quote: fade up elegantly
  useScrollReveal(planetRef, { y: 60, children: true, stagger: 0.2, duration: 1.2 });

  // Pricing: cards slide up
  useScrollReveal(pricingRef, { y: 50, duration: 1 });
  useScrollReveal(pricingGridRef, { y: 40, children: true, stagger: 0.2, duration: 0.9 });

  // CTA: fade in content
  useScrollReveal(ctaRef, { y: 30, duration: 1.2 });

  // Footer: columns stagger in
  useScrollReveal(footerRef, { y: 30, children: true, stagger: 0.1, duration: 0.8 });

  // ... then attach refs to JSX elements:
  // <section ref={problemRef} className={styles.problem}>
  //   <div className={styles.problemLeft}> ...
  //   <div ref={problemImgRef} className={styles.problemRight}>
  // <section ref={betterRef} className={styles.better}>
  //   <div ref={featuresRef}> wrapping the 3 feature rows
  // <section ref={meetRef}>
  //   <div ref={meetGridRef} className={styles.meetGrid}>
  // <section ref={statsRef}>
  //   <div ref={statsGridRef} className={styles.statsGrid}>
  // <section ref={planetRef}>
  // <section ref={pricingRef}>
  //   <div ref={pricingGridRef} className={styles.pricingGrid}>
  // <section ref={ctaRef}>
  // <footer ref={footerRef}>
```

Every section/subsection gets a ref. The hook sets initial state (invisible, shifted) and animates on scroll enter.

- [ ] **Step 3: Verify all sections animate on scroll**

Reload page, scroll slowly. Each section should slide/fade in as it enters the viewport. Feature rows stagger. Cards stagger. Stats stagger.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useScrollReveal.ts src/pages/LandingPage.tsx
git commit -m "feat: add GSAP scroll-triggered reveal animations to all sections"
```

---

### Task 4: Stat Counter Animation (196.000 counts up from 0)

**Files:**
- Create: `src/hooks/useCountUp.ts`
- Modify: `src/pages/LandingPage.tsx` (use counter for stat)

- [ ] **Step 1: Create useCountUp hook**

Create `src/hooks/useCountUp.ts`:

```ts
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
            const v = decimals > 0
              ? obj.val.toFixed(decimals)
              : Math.floor(obj.val).toString();
            // Add thousands separator
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
```

- [ ] **Step 2: Apply counter to 196.000 stat in LandingPage**

In `LandingPage.tsx`, replace the static `196.000` with the counter:

```tsx
import { useCountUp } from '../hooks/useCountUp';

// Inside component:
const statRef = useRef<HTMLSpanElement>(null);
const statDisplay = useCountUp(statRef, { end: 196000, duration: 2.5, separator: '.' });

// In JSX:
<span ref={statRef} className={styles.problemStat}>{statDisplay}</span>
```

- [ ] **Step 3: Verify counter animation**

Scroll to problem section — "196.000" should count up from 0 over 2.5 seconds.

- [ ] **Step 4: Commit**

```bash
git add src/hooks/useCountUp.ts src/pages/LandingPage.tsx
git commit -m "feat: add counter animation for 196.000 stat"
```

---

### Task 5: Parallax Images

**Files:**
- Create: `src/hooks/useParallax.ts`
- Modify: `src/pages/LandingPage.tsx` (add parallax to images)
- Modify: `src/pages/LandingPage.module.css` (add overflow hidden to image containers)

- [ ] **Step 1: Create useParallax hook**

Create `src/hooks/useParallax.ts`:

```ts
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
    // Find the img inside or use el directly
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

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [ref, speed]);
}
```

- [ ] **Step 2: Apply parallax to problem image and planet image**

In `LandingPage.tsx`:

```tsx
import { useParallax } from '../hooks/useParallax';

const problemImgRef = useRef<HTMLDivElement>(null);  // already exists
const planetImgRef = useRef<HTMLImageElement>(null);
const ctaBgRef = useRef<HTMLImageElement>(null);

useParallax(problemImgRef, -20);
useParallax(planetImgRef, -15);
useParallax(ctaBgRef, -10);

// Attach planetImgRef to planet image:
// <img ref={planetImgRef} className={styles.planetImage} ...>
// Attach ctaBgRef to CTA background:
// <img ref={ctaBgRef} className={styles.ctaBg} ...>
```

- [ ] **Step 3: Add overflow:hidden to image containers**

In `LandingPage.module.css`:

```css
.problemRight {
  /* ... existing ... */
  overflow: hidden;
}

.planet {
  /* ... add: */
  overflow: hidden;
}
```

- [ ] **Step 4: Verify parallax effect**

Scroll past problem image and planet image — they should move at a different speed than the page, creating depth.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useParallax.ts src/pages/LandingPage.tsx src/pages/LandingPage.module.css
git commit -m "feat: add parallax effect to images"
```

---

### Task 6: Text Split Reveal for Spaced Headings

**Files:**
- Create: `src/components/SplitText.tsx`
- Create: `src/components/SplitText.module.css`
- Modify: `src/pages/LandingPage.tsx` (replace static headings with SplitText)

- [ ] **Step 1: Create SplitText CSS**

Create `src/components/SplitText.module.css`:

```css
.wrapper {
  overflow: hidden;
  display: inline-block;
}

.char {
  display: inline-block;
  transform: translateY(100%);
  opacity: 0;
  transition: none;
}

.word {
  display: inline-block;
  overflow: hidden;
  margin-right: 0.3em;
}

.line {
  display: block;
  overflow: hidden;
}
```

- [ ] **Step 2: Create SplitText component**

Create `src/components/SplitText.tsx`:

```tsx
import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from './SplitText.module.css';

gsap.registerPlugin(ScrollTrigger);

interface SplitTextProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
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

  // Split text into characters wrapped in spans
  const chars: ReactNode[] = [];
  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if (ch === ' ' || ch === '\u00A0') {
      chars.push(<span key={i} className={styles.char} style={{ width: '0.3em' }}>&nbsp;</span>);
    } else {
      chars.push(<span key={i} className={styles.char}>{ch}</span>);
    }
  }

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

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [delay, stagger, duration, start]);

  // @ts-expect-error dynamic tag
  return <Tag ref={wrapperRef} className={`${styles.wrapper} ${className}`}>{chars}</Tag>;
};

export default SplitText;
```

- [ ] **Step 3: Replace key headings with SplitText in LandingPage**

Replace these headings in `LandingPage.tsx`:

```tsx
import SplitText from '../components/SplitText';

// Problem heading:
<SplitText as="h2" className={styles.problemHeading} stagger={0.02} duration={0.6}>
  ¿Cuánto podrías ahorrar con datos reales?
</SplitText>

// Better heading:
<SplitText as="h2" className={styles.betterHeading} stagger={0.02} duration={0.6}>
  Datos reales, decisiones inteligentes
</SplitText>

// Meet heading:
<SplitText as="h2" className={styles.meetHeading} stagger={0.015} duration={0.5}>
  Conoce AgroSmart
</SplitText>

// Stats heading:
<SplitText as="h2" className={styles.statsHeading} stagger={0.015} duration={0.5}>
  Probado en campo
</SplitText>
```

Note: SplitText takes plain text (not spaced). The letter-spacing is handled by the existing CSS classes.

- [ ] **Step 4: Verify text reveal animations**

Scroll to each heading — characters should cascade in from below, one by one. Very cinematic.

- [ ] **Step 5: Commit**

```bash
git add src/components/SplitText.tsx src/components/SplitText.module.css src/pages/LandingPage.tsx
git commit -m "feat: add character-by-character text reveal for headings"
```

---

### Task 7: Final Integration & Polish

**Files:**
- Modify: `src/pages/LandingPage.tsx` (ensure all refs attached, no conflicts)
- Modify: `src/pages/LandingPage.module.css` (will-change hints for performance)

- [ ] **Step 1: Add GPU acceleration hints**

Add to `LandingPage.module.css`:

```css
/* GPU hints for animated elements */
.problemLeft, .problemRight, .featureRow,
.meetCard, .statCol, .planetImage, .ctaContent {
  will-change: transform, opacity;
}
```

- [ ] **Step 2: Verify full page flow**

Reload http://localhost:5174 and scroll through entire page:
1. Hero: scroll-scrub video plays (existing)
2. Problem: text slides up, image slides in from right, 196.000 counts up
3. Features: heading reveals char-by-char, body fades up, feature rows stagger in
4. Cards: heading reveals, cards stagger in with slight scale
5. Stats: heading reveals, stat columns stagger in
6. Quote: elements stagger in elegantly
7. Pricing: heading fades, plan cards slide up
8. CTA: content fades in
9. Footer: columns stagger in
10. Throughout: buttery smooth Lenis scroll + grain texture

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: complete Awwwards-level scroll animation system"
```

- [ ] **Step 5: Push to GitHub**

```bash
git push origin master
```
