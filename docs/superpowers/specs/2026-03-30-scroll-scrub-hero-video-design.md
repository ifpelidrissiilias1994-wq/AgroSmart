# Scroll-Scrub Hero Video — Design Spec

**Date:** 2026-03-30
**Status:** Approved

## Overview

A canvas-based scroll-scrub video animation for the AgroSmart landing page hero section. A vertical 9:16 cinematic clip of an Andalusian agricultural field is extracted into ~120 JPEG frames. As the user scrolls, GSAP ScrollTrigger drives frame-by-frame playback on a `<canvas>` element — scrolling down advances the video, scrolling up rewinds it.

## Layout

```
[Hero Section - "Agricultura, Inteligente."]   ← existing
[ScrollVideo wrapper - height: 500vh]          ← NEW
  ├── Sticky container (100vh, position: sticky; top: 0)
  │   ├── <canvas> — full viewport, cover-fit
  │   ├── Hero text ghost overlay (fades OUT 0-15% scroll)
  │   └── Problem teaser overlay (fades IN 85-100% scroll)
[Problem Section - "El campo pierde"]          ← existing
```

The existing `<img class="heroImage">` (Unsplash placeholder) is removed and replaced by the ScrollVideo component.

## Scroll Behavior

- **Wrapper:** `height: 500vh` (5x viewport) creates the scroll runway
- **Sticky inner:** `position: sticky; top: 0; height: 100vh` pins the canvas
- **GSAP ScrollTrigger:** `trigger` = wrapper, `scrub: 0.5`, `start: "top top"`, `end: "bottom bottom"`
- Progress 0→1 maps to frame index 0→119

## Transitions

- **0% → 15%:** Hero headline ghost ("Agricultura, Inteligente.") fades opacity 1→0
- **85% → 100%:** Problem teaser ("EL PROBLEMA" tag + heading + down arrow) fades opacity 0→1

## Frame Extraction

```bash
ffmpeg -i hero_section.mp4 \
  -vf "crop=ih*16/9:ih:(iw-ih*16/9)/2:0,scale=1920:-1" \
  -q:v 5 -vframes 120 \
  public/frames/hero/frame-%03d.jpg
```

- 120 frames, center-cropped from 9:16 to 16:9, scaled to 1920px width
- JPEG quality 5 (~80% equivalent)
- Output: `public/frames/hero/frame-001.jpg` through `frame-120.jpg`

## Canvas Logic

1. On mount: preload all 120 `Image` objects
2. Frame-skip guard: canvas only redraws when `frameIndex` changes between scroll ticks
3. Cover-fit math: canvas dimensions match viewport; `drawImage` crops/centers to cover
4. Resize handler updates canvas dimensions on window resize

## Loading State

- Show `frame-001.jpg` as a static `<img>` poster immediately
- Initialize ScrollTrigger as soon as frame 1 is loaded — do NOT wait for all 120
- Remaining frames load in background; canvas uses the latest available frame

## Accessibility: prefers-reduced-motion

If `prefers-reduced-motion: reduce` is active:
- Render `frame-001.jpg` as a static full-width `<img>`
- No GSAP, no ScrollTrigger, no scroll behavior
- No 500vh wrapper — just a static image section

## Dependencies

- `gsap` (core)
- `@gsap/react` (React hooks)

## Files

| File | Action |
|------|--------|
| `package.json` | Add `gsap`, `@gsap/react` |
| `src/components/ScrollVideo.tsx` | New component |
| `src/components/ScrollVideo.module.css` | New styles |
| `src/pages/LandingPage.tsx` | Import ScrollVideo, replace heroImage, place between hero and problem |
| `public/frames/hero/frame-*.jpg` | ~120 extracted JPEG frames |

## Brand Tokens

- Background: `var(--fm-bg)` (#F5F0E8)
- Text: `var(--fm-text)` (#1A1A14)
- Muted: `var(--fm-muted)` (#6B6454)
- Forest: `var(--fm-forest)` (#2D5A1B)
- Fonts: Playfair Display (headlines), DM Sans (body), DM Mono (tags)
