/**
 * CometOrbitLoader — Loader V4, "Comet Orbit".
 *
 * Reverse-engineered from the reference recording. What the eye sees in the
 * reference is a comet orbiting a disc: a bright head sweeps around and a
 * long tail fades out behind it. Pixel-level measurement of the recording
 * shows what actually happens: the 126 small soft-edged stars NEVER move —
 * what travels is a wave of brightness. As the wave's head passes over a
 * star, that star flares smoothly to near-white; behind the head the stars
 * dim again, which reads as the comet's fading tail. One full orbit takes
 * ~1.43 s, counter-clockwise, at constant speed.
 *
 * The phase of each star (the moment it peaks) was fitted to the reference:
 * the sweep behaves like a "terminator" travelling around an axis tilted
 * out of the screen plane (psi = 290 deg, alpha = 60 deg), so the comet
 * appears to wash over the field with a slight 3D tilt instead of rotating
 * flat like a clock hand. Each star follows a raised-cosine brightness
 * pulse, cos^2(pi * u), whose width at half maximum is exactly half a cycle.
 *
 * Rendering: one react-native-svg <Svg> (a single native view) holding 126
 * <Circle> elements whose `fillOpacity` is driven on the UI thread by
 * react-native-reanimated. One shared linear clock drives every star, and
 * each star derives its own opacity from its precomputed phase — there are
 * no per-frame JS state updates, no timers, and no React re-renders while
 * the loop runs.
 *
 * Fully independent of Loader V1 and V2.
 */

import React, { useEffect, useMemo } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface CometOrbitLoaderProps {
  /** Overall diameter of the loader in dp. Everything scales proportionally. Default 160. */
  size?: number;
  /** Speed multiplier: 2 = twice as fast, 0.5 = half speed. Default 1 (matches the reference). */
  speed?: number;
  /** Star color. The reference uses white on a dark background. Default '#FFFFFF'. */
  color?: string;
  /** Optional style applied to the loader's container. */
  style?: StyleProp<ViewStyle>;
}

// ---------------------------------------------------------------------------
// Tuned constants (measured from the reference video)
// ---------------------------------------------------------------------------

/* PURE-LOGIC-BEGIN — everything down to PURE-LOGIC-END is plain TypeScript
 * with no React / React Native imports. scripts/verify_comet.mjs extracts
 * exactly this block from THIS file, compiles it, and re-runs the
 * statistical checks against the reference measurements. Keep it
 * dependency-free. */

/** One full orbit of the comet. Measured period: ~1.43 s. */
const BASE_PERIOD_MS = 1430;

/** Opacity of a star in its dim state. In the reference, stars fade until
 *  they are indistinguishable from the background, so the floor is (almost)
 *  zero; a tiny 5 % keeps a whisper of the full disc so the loader never
 *  fully vanishes. */
const MIN_OPACITY = 0.05;

/** Number of stars: even interior scatter + jittered outer ring (measured 126). */
const INTERIOR_DOTS = 62;
const RIM_DOTS = 64;

/** Seed for the deterministic PRNG. Any fixed number works; this one matches the analysis. */
const RNG_SEED = 1337;

/** Golden angle (~137.5 deg) — spreads the interior sunflower evenly. */
const GOLDEN_ANGLE = 2.399963229728653;

// The comet's phase pattern behaves like a "terminator" sweeping around a
// sphere whose rotation axis is tilted with respect to the screen. These two
// angles place that axis; they were fitted to the reference recording.
const AXIS_PSI = (290 * Math.PI) / 180; // in-screen-plane direction of the axis
const AXIS_ALPHA = (60 * Math.PI) / 180; // tilt of the axis out of the screen plane
const PHASE_OFFSET = 0.667; // rotates the whole loop in time (arbitrary start point)

// ---------------------------------------------------------------------------
// Deterministic star field
// ---------------------------------------------------------------------------

/**
 * mulberry32 — a tiny, fast, seeded PRNG.
 * We ship our own instead of using Math.random() so the star layout is
 * identical on every device and every render (no flicker, no layout
 * surprises, testable).
 */
function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A single star: position in the 100 x 100 viewBox space plus its flare phase. */
interface DotSpec {
  /** Center x in viewBox units (0..100). */
  cx: number;
  /** Center y in viewBox units (0..100). */
  cy: number;
  /** Star radius in viewBox units (~6 % of the loader diameter including halo). */
  r: number;
  /** Phase in [0, 1): the fraction of a cycle at which this star peaks. */
  phi: number;
}

/**
 * Builds the complete star field exactly once.
 *
 * Layout (matches the measured reference):
 *  - 62 interior stars: a golden-angle sunflower (even area coverage) with a
 *    small random jitter, filling the disc out to 82 % of the radius.
 *  - 64 rim stars: an almost-even ring at ~88 % of the radius with jittered
 *    angles and radii — the reference shows the same slight outer concentration.
 *
 * Phase (when each star flares):
 *  Each star is treated as a point on the front hemisphere of a unit sphere
 *  (screen position (x, y), hidden depth z = sqrt(1 - x^2 - y^2)). The comet
 *  sweeps around a tilted axis, so a star flares when the sweeping
 *  "terminator" crosses its longitude around that axis. This reproduces the
 *  reference's combined angular + radial phase pattern with ~12 deg accuracy.
 */
function buildDots(): DotSpec[] {
  const rng = createRng(RNG_SEED);

  // viewBox geometry: circle of radius 45 centered at (50, 50). Each star is
  // drawn as a soft-edged disc of radius 2.9 (a bright core plus a faint halo,
  // matching the reference where bright stars measure ~6 % of the loader).
  const CENTER = 50;
  const DISC_RADIUS = 45;
  const DOT_RADIUS = 2.9;
  // Minimum distance between star centers in unit-disc coordinates. The
  // reference has ~5 px at its 156 px scale, which scales to ~0.07 here.
  // Without this, the jitter can occasionally place two stars on top of each
  // other, which reads as a single fat star.
  const MIN_SEPARATION = 0.07;

  // Orthonormal frame of the sweep axis (unit vectors).
  // ax  = the rotation axis itself (tilted out of the screen plane),
  // b   = in-screen direction perpendicular to the axis projection,
  // c   = completes the right-handed frame.
  const sa = Math.sin(AXIS_ALPHA);
  const ax = [Math.cos(AXIS_PSI) * sa, Math.sin(AXIS_PSI) * sa, Math.cos(AXIS_ALPHA)];
  const b = [-Math.sin(AXIS_PSI), Math.cos(AXIS_PSI), 0];
  const c = [
    ax[1] * b[2] - ax[2] * b[1],
    ax[2] * b[0] - ax[0] * b[2],
    ax[0] * b[1] - ax[1] * b[0], // cross(ax, b)
  ];

  // Star positions on the unit disc (x right, y up, length <= 1).
  const positions: Array<[number, number]> = [];

  // Interior: jittered sunflower.
  for (let i = 0; i < INTERIOR_DOTS; i++) {
    let radius = 0.82 * Math.sqrt((i + 0.5) / INTERIOR_DOTS);
    let angle = i * GOLDEN_ANGLE;
    radius += (rng() - 0.5) * 0.09;
    angle += (rng() - 0.5) * 0.45;
    radius = Math.min(Math.max(radius, 0.04), 0.84);
    positions.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
  }

  // Outer ring: even angles + jitter, radius ~88 % with spread.
  for (let i = 0; i < RIM_DOTS; i++) {
    const angle = (i * 2 * Math.PI) / RIM_DOTS + (rng() - 0.5) * 0.11;
    let radius = 0.885 + (rng() - 0.5) * 0.19;
    radius = Math.min(Math.max(radius, 0.79), 0.99);
    positions.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
  }

  // Separation pass: deterministically nudge any star that ended up too close
  // to an earlier one (rotate a little and step the radius in/out). Runs a
  // handful of times at most and only touches the odd unlucky star.
  for (let i = 1; i < positions.length; i++) {
    let [x, y] = positions[i];
    for (let attempt = 0; attempt < 6; attempt++) {
      const clashes = positions.some(
        (p, j) => j < i && Math.hypot(x - p[0], y - p[1]) < MIN_SEPARATION
      );
      if (!clashes) {
        break;
      }
      const radius = Math.min(Math.hypot(x, y), 0.96);
      const angle =
        Math.atan2(y, x) + 0.05 * (attempt + 1) * (i % 2 === 0 ? 1 : -1);
      const nextRadius = Math.min(
        Math.max(radius + 0.015 * (attempt + 1) * (i % 3 === 0 ? -1 : 1), 0.08),
        0.98
      );
      x = nextRadius * Math.cos(angle);
      y = nextRadius * Math.sin(angle);
    }
    positions[i] = [x, y];
  }

  // Convert positions to renderable stars with their flare phase.
  const dots: DotSpec[] = [];
  for (const [unitX, unitY] of positions) {
    // Depth on the front hemisphere of the unit sphere.
    const z = Math.sqrt(Math.max(0, 1 - (unitX * unitX + unitY * unitY)));
    // Longitude of the point around the sweep axis.
    const pb = unitX * b[0] + unitY * b[1]; // b has no z component
    const pc = unitX * c[0] + unitY * c[1] + z * c[2];
    const longitude = Math.atan2(pb, pc);
    // Convert longitude to the star's flare phase (fitted sign + offset).
    const phi = (((-longitude / (2 * Math.PI)) + PHASE_OFFSET) % 1 + 1) % 1;
    // Convert to screen coordinates (SVG y grows downwards).
    dots.push({
      cx: CENTER + unitX * DISC_RADIUS,
      cy: CENTER - unitY * DISC_RADIUS,
      r: DOT_RADIUS,
      phi,
    });
  }

  return dots;
}

/* PURE-LOGIC-END */

// ---------------------------------------------------------------------------
// Animated star
// ---------------------------------------------------------------------------

/** Wrap Circle once so Reanimated can drive its props from the UI thread. */
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CometStarProps {
  /** The shared clock: the comet's orbital progress in [0, 1). */
  progress: SharedValue<number>;
  /** This star's flare phase in [0, 1). */
  phi: number;
  cx: number;
  cy: number;
  r: number;
  /** Id of the shared soft-edge gradient (defined once per loader instance). */
  gradientId: string;
}

/**
 * A single star in the field. The worklet below runs on the UI thread for
 * every animation frame — it is deliberately tiny: one subtraction, one cos,
 * one multiply. 126 of these cost far less than one frame budget.
 *
 * Brightness curve: opacity = MIN + (1 - MIN) * cos^2(pi * u), where
 * u = (clock - phase) mod 1 is the time since this star's last peak. cos^2 is
 * the raised-cosine pulse measured from the reference: it is 1 at the peak,
 * ~0.5 half a period away, 0 at the opposite phase, and its width at half
 * maximum is exactly half a cycle — matching the measured FWHM (~0.47).
 */
function CometStar({ progress, phi, cx, cy, r, gradientId }: CometStarProps) {
  const animatedProps = useAnimatedProps(() => {
    'worklet';
    let u = progress.value - phi;
    if (u < 0) {
      u += 1;
    }
    const c = Math.cos(Math.PI * u);
    return { fillOpacity: MIN_OPACITY + (1 - MIN_OPACITY) * c * c };
  });

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      fill={`url(#${gradientId})`}
      animatedProps={animatedProps}
    />
  );
}

const MemoizedCometStar = React.memo(CometStar);

// ---------------------------------------------------------------------------
// CometOrbitLoader
// ---------------------------------------------------------------------------

/** Clamp a value into [min, max]; NaN/Infinity fall back to the default. */
function toSafeNumber(
  value: number | undefined,
  fallback: number,
  min: number,
  max: number
): number {
  if (value == null || !Number.isFinite(value)) {
    return fallback;
  }
  return Math.min(Math.max(value, min), max);
}

// Used only to generate per-instance gradient ids. SVG ids are document-global
// when rendering to the web, so two loaders with different colors on one
// screen must not share a gradient definition.
let instanceCounter = 0;

function CometOrbitLoader({
  size = 160,
  speed = 1,
  color = '#FFFFFF',
  style,
}: CometOrbitLoaderProps) {
  // The star field is deterministic — build it once for the component's lifetime.
  const dots = useMemo(buildDots, []);

  // Unique id for this instance's gradient definition.
  const gradientId = useMemo(() => `comet-orbit-glow-${++instanceCounter}`, []);

  // Guard props so extreme values cannot break geometry or freeze the loop.
  const safeSize = toSafeNumber(size, 160, 20, 512);
  const safeSpeed = toSafeNumber(speed, 1, 0.1, 10);
  const safeColor = typeof color === 'string' && color.length > 0 ? color : '#FFFFFF';

  // The single animation clock: the comet's orbital progress, 0 -> 1 linearly,
  // forever. Linear easing is essential — the star phases are relative, so a
  // constant sweep rate is what makes the loop read as one continuous comet.
  // withRepeat restarts the inner timing from 0 each cycle, and every star
  // wraps its math mod 1, so the wrap from 1 back to 0 is mathematically
  // invisible (seamless loop).
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, {
        duration: BASE_PERIOD_MS / safeSpeed,
        easing: Easing.linear,
      }),
      -1, // repeat forever
      false, // do not reverse — the comet keeps one orbital direction
    );
    // Stop the clock when unmounting or when the speed changes, so nothing
    // keeps running (or stacks up) after the screen is left.
    return () => {
      cancelAnimation(progress);
    };
  }, [progress, safeSpeed]);

  return (
    <View
      style={[styles.container, style]}
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
    >
      <Svg width={safeSize} height={safeSize} viewBox="0 0 100 100">
        <Defs>
          {/* Soft-edged star: a solid core fading out over the outer 45 % of
              the radius, matching the reference's measured radial profile
              (bright core ~6 % of the loader, quick falloff, faint halo).
              Shared by all 126 circles, so it costs one definition and zero
              extra animated elements. */}
          <RadialGradient id={gradientId} cx={0.5} cy={0.5} r={0.5}>
            <Stop offset={0.55} stopColor={safeColor} stopOpacity={1} />
            <Stop offset={0.8} stopColor={safeColor} stopOpacity={0.3} />
            <Stop offset={1} stopColor={safeColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        {dots.map((dot, index) => (
          <MemoizedCometStar
            key={index}
            progress={progress}
            phi={dot.phi}
            cx={dot.cx}
            cy={dot.cy}
            r={dot.r}
            gradientId={gradientId}
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { CometOrbitLoader };
export default CometOrbitLoader;