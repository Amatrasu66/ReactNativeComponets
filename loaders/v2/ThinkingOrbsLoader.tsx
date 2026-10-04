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
const PARTICLE_COUNT = 160;
/** Camera distance in sphere radii (smaller = stronger perspective). */
const PERSPECTIVE = 3.2;
/** Static tilt of the spin axis (radians). */
const TILT_X = 0.42;
const TILT_Z = -0.2;
/** Amplitude of the loop-periodic "vortex" shear (radians). */
const SWIRL = 0.9;

export interface LoaderV2Props {
  /** Outer diameter of the spinner in px. Default 120. */
  size?: number;
  /** Speed multiplier. 1 matches the reference (3s per loop). Default 1. */
  speed?: number;
  style?: ViewStyle;
}

/* ---------------------------------- utils --------------------------------- */

/** Tiny deterministic PRNG so the particle layout never reshuffles on re-render. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Particle {
  sinLat: number;
  cosLat: number;
  lon0: number;
  radius: number;
  bobAmp: number;
  bobPhase: number;
  core: number;
  halo: number;
}

/** Fibonacci-sphere distribution + jitter -> even but organic coverage. */
function buildParticles(count: number, scale: number): Particle[] {
  const rand = mulberry32(0x0ea5c0de);
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    // 1) point on the unit sphere
    let y = 1 - (2 * (i + 0.5)) / count;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    let x = r * Math.cos(i * goldenAngle);
    let z = r * Math.sin(i * goldenAngle);
    // 2) organic jitter, renormalised back onto the sphere
    x += (rand() - 0.5) * 0.16;
    y += (rand() - 0.5) * 0.16;
    z += (rand() - 0.5) * 0.16;
    const len = Math.hypot(x, y, z) || 1;
    x /= len;
    y /= len;
    z /= len;
    // 3) per-particle look
    const bright = rand() < 0.08; // a few larger "hero" orbs
    const core = (bright ? 3.2 + rand() * 1.8 : 1.6 + rand() * 1.6) * scale;
    particles.push({
      sinLat: y,
      cosLat: Math.sqrt(Math.max(0, 1 - y * y)),
      lon0: Math.atan2(x, z),
      radius: 0.92 + rand() * 0.08, // slight radial variation
      bobAmp: 0.02 + rand() * 0.05,
      bobPhase: rand() * TWO_PI,
      core,
      halo: core * 3,
    });
  }
  return particles;
}

/* ------------------------------- one particle ------------------------------ */

interface OrbProps {
  particle: Particle;
  progress: SharedValue<number>;
  sphereRadius: number;
}

/**
 * One dot. The animated style performs the full 3D -> 2D pipeline per frame:
 * spin -> vortex shear -> tilt -> perspective -> depth shading. Because every
 * term is periodic in the loop, the wrap from progress 1 -> 0 is seamless.
 */
const Orb = memo(function Orb({ particle, progress, sphereRadius }: OrbProps) {
  const animated = useAnimatedStyle(
    () => {
      const w = TWO_PI * progress.value;

      // Spin around the Y axis + vortex shear (differential twist by latitude,
      // shear is zero at t=0 and t=1, so the loop never pops).
      const lon = particle.lon0 + w + SWIRL * Math.sin(w) * particle.sinLat;
      const cl = particle.cosLat;
      let x = cl * Math.sin(lon);
      let y = particle.sinLat;
      let z = cl * Math.cos(lon);

      // Small loop-periodic vertical drift for organic motion.
      y += particle.bobAmp * Math.sin(w + particle.bobPhase);

      x *= particle.radius;
      y *= particle.radius;
      z *= particle.radius;

      // Tilt the spin axis: roll around Z, then pitch around X.
      const cz = Math.cos(TILT_Z);
      const sz = Math.sin(TILT_Z);
      const x2 = x * cz - y * sz;
      const y2 = x * sz + y * cz;
      const cx = Math.cos(TILT_X);
      const sx = Math.sin(TILT_X);
      const y3 = y2 * cx - z * sx;
      const z3 = y2 * sx + z * cx;

      // Perspective projection (+z towards the camera) and depth shading.
      const persp = PERSPECTIVE / (PERSPECTIVE - z3);
      const depth = (z3 + 1) / 2; // 0 = far side, 1 = near side
      const shade = depth * depth * (3 - 2 * depth); // smoothstep

      return {
        transform: [
          { translateX: x2 * sphereRadius * persp },
          { translateY: -y3 * sphereRadius * persp },
          { scale: persp * (0.8 + 0.4 * depth) },
        ],
        opacity: 0.14 + 0.86 * shade,
      };
    },
    [particle, sphereRadius],
  );

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dot,
        {
          width: particle.halo,
          height: particle.halo,
          borderRadius: particle.halo / 2,
          marginLeft: -particle.halo / 2,
          marginTop: -particle.halo / 2,
        },
        animated,
      ]}
    >
      <View
        style={{
          width: particle.core,
          height: particle.core,
          borderRadius: particle.core / 2,
          backgroundColor: 'rgba(255,255,255,0.92)',
        }}
      />
    </Animated.View>
  );
});

/* ------------------------------- the loader -------------------------------- */

function ThinkingOrbsLoaderBase({ size = 120, speed = 1, style }: LoaderV2Props) {
  const safeSpeed = speed > 0 ? speed : 1;
  const particles = useMemo(
    () => buildParticles(PARTICLE_COUNT, size / 120),
    [size],
  );
  const progress = useSharedValue(0);

  useEffect(() => {
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
        <Orb key={i} particle={p} progress={progress} sphereRadius={sphereRadius} />
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
    backgroundColor: 'rgba(255,255,255,0.16)', // soft halo = fake bloom
  },
});

export const LoaderV2 = ThinkingOrbsLoaderBase;
export default ThinkingOrbsLoaderBase;