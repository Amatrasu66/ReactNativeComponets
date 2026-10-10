// Loader V2 — "Thinking Orbs"
//
// Reproduces the particle-sphere spinner from the reference recording:
// a hollow sphere of small glowing dots spinning around a tilted axis with a
// subtle vortex shear, one seamless loop every 3 seconds (reference UI shows
// "Vortex — 3s loop", Speed 1.00).
//
// Implementation notes:
// - All motion runs on the UI thread via react-native-reanimated.
// - A single shared value (progress 0..1, linear, repeating) drives every
//   particle; each particle derives its 3D position -> 2D projection inside a
//   worklet. No JS re-renders, no timers, no rAF loop on the JS thread.
// - Depth is faked with per-particle perspective scale + opacity falloff.
// - Glow is approximated by layering a soft halo circle under each core dot.

import { memo, useEffect, useMemo } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

const TWO_PI = Math.PI * 2;

/** One full revolution of the reference effect. */
const LOOP_MS = 3000;
/** Number of dots on the sphere. */
const PARTICLE_COUNT = 90;
/** Camera distance in sphere radii. */
const PERSPECTIVE = 3.6;
/** Static tilt of the spin axis (radians) - gentle tilt like a rotating globe. */
const TILT_X = 0.28;
const TILT_Z = -0.15;
/** Subtle vortex / swirl amplitude. */
const SWIRL = 0.25;

export interface LoaderV2Props {
  /** Outer diameter of the spinner in px. Default 120. */
  size?: number;
  /** Speed multiplier. 1 matches reference (3s per loop). Default 1. */
  speed?: number;
  /** Reverse spin rotation direction. Default false (clockwise). */
  reverse?: boolean;
  /** Dot size multiplier / scale. Default 1 (base 3.2px scaled). */
  dotScale?: number;
  /** Total number of particles on the sphere. Default 90. */
  particleCount?: number;
  /** Tilt angle of the spin axis (radians). Default 0.28. */
  tilt?: number;
  /** Max opacity multiplier for the dots (0.2 to 1). Default 1. */
  opacity?: number;
  /** Amplitude of the vortex swirl (radians). Default 0.25. */
  swirl?: number;
  style?: ViewStyle;
}

/* ---------------------------------- utils --------------------------------- */

interface Particle {
  sinLat: number;
  cosLat: number;
  lon0: number;
  radius: number;
  core: number;
  halo: number;
}

/** Pure Fibonacci-sphere distribution -> perfectly uniform lattice coverage. */
function buildParticles(count: number, scale: number, dotScale: number): Particle[] {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~2.39996 rad
  const particles: Particle[] = [];
  const baseDotSize = 3.2 * scale * dotScale;

  for (let i = 0; i < count; i++) {
    // Exact Fibonacci sphere formula for uniform distribution without random clustering
    const y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const lon = i * goldenAngle;

    particles.push({
      sinLat: y,
      cosLat: r,
      lon0: lon,
      radius: 1.0,
      core: baseDotSize,
      halo: baseDotSize * 2.2,
    });
  }
  return particles;
}

/* ------------------------------- one particle ------------------------------ */

interface OrbProps {
  particle: Particle;
  progress: SharedValue<number>;
  sphereRadius: number;
  reverse: boolean;
  tilt: number;
  swirl: number;
  maxOpacity: number;
}

/**
 * One dot. The animated style performs the full 3D -> 2D pipeline per frame:
 * spin -> vortex shear -> tilt -> perspective -> depth shading. Because every
 * term is periodic in the loop, the wrap from progress 1 -> 0 is seamless.
 */
const Orb = memo(function Orb({
  particle,
  progress,
  sphereRadius,
  reverse,
  tilt,
  swirl,
  maxOpacity,
}: OrbProps) {
  const animated = useAnimatedStyle(
    () => {
      const dir = reverse ? -1 : 1;
      const w = TWO_PI * progress.value * dir;

      // Spin around the Y axis + vortex shear (differential twist by latitude,
      // shear is zero at t=0 and t=1, so the loop never pops).
      const lon = particle.lon0 + w + swirl * Math.sin(w) * particle.sinLat;
      const cl = particle.cosLat;
      const x = cl * Math.sin(lon);
      const y = particle.sinLat;
      const z = cl * Math.cos(lon);

      // Tilt the spin axis: roll around Z, then pitch around X.
      const cz = Math.cos(TILT_Z);
      const sz = Math.sin(TILT_Z);
      const x2 = x * cz - y * sz;
      const y2 = x * sz + y * cz;
      const cx = Math.cos(tilt);
      const sx = Math.sin(tilt);
      const y3 = y2 * cx - z * sx;
      const z3 = y2 * sx + z * cx;

      // Perspective projection (+z towards the camera) and depth shading.
      const persp = PERSPECTIVE / (PERSPECTIVE - z3);
      // Normalized depth in [0, 1] (0 at back, 1 at front)
      const depth = (z3 + 1) / 2;
      // Linear or subtle smoothstep depth shading
      const shade = depth * 0.75 + 0.25;

      return {
        transform: [
          { translateX: x2 * sphereRadius * persp },
          { translateY: -y3 * sphereRadius * persp },
          { scale: persp * (0.65 + 0.45 * depth) },
        ],
        opacity: Math.max(0.18 * maxOpacity, Math.min(1.0, shade) * maxOpacity),
        zIndex: Math.round(depth * 100),
      };
    },
    [particle, sphereRadius, reverse, tilt, swirl, maxOpacity],
  );

  return (
    <Animated.View style={[styles.dot, animated]}>
      <View
        style={{
          width: particle.core,
          height: particle.core,
          borderRadius: particle.core / 2,
          backgroundColor: '#FFFFFF',
        }}
      />
    </Animated.View>
  );
});

/* ------------------------------- the loader -------------------------------- */

function ThinkingOrbsLoaderBase({
  size = 120,
  speed = 1,
  reverse = false,
  dotScale = 1,
  particleCount = PARTICLE_COUNT,
  tilt = TILT_X,
  opacity = 1,
  swirl = SWIRL,
  style,
}: LoaderV2Props) {
  const safeSpeed = speed > 0 ? speed : 1;
  const safeCount = Math.max(12, Math.min(240, Math.round(particleCount)));
  const particles = useMemo(
    () => buildParticles(safeCount, size / 120, dotScale),
    [safeCount, size, dotScale],
  );
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withRepeat(
      withTiming(1, { duration: LOOP_MS / safeSpeed, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(progress);
  }, [safeSpeed, progress]);

  const sphereRadius = size * 0.41;

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      {particles.map((p, i) => (
        <Orb
          key={`${i}-${safeCount}`}
          particle={p}
          progress={progress}
          sphereRadius={sphereRadius}
          reverse={reverse}
          tilt={tilt}
          swirl={swirl}
          maxOpacity={opacity}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)', // subtle ambient glow halo
  },
});

export const ThinkingOrbsLoader = ThinkingOrbsLoaderBase;
export const LoaderV2 = ThinkingOrbsLoaderBase;
export default ThinkingOrbsLoaderBase;