/**
 * Loader V4 — "Comet Orbit"
 *
 * A glowing comet head travels a tilted elliptical orbit, leaving a trail
 * of fading dots behind it. Dots shrink and dim on the far side of the
 * orbit (fake 3D depth) and a small "nucleus" breathes at the centre.
 *
 * Rendering:
 *   - The static track is ONE react-native-svg <Path>, generated once at
 *     module load from the same maths the animated dots use.
 *   - The comet, trail and nucleus are plain Views animated on the UI
 *     thread by Reanimated (transform + opacity only).
 *
 * Animation model:
 *   - A single shared value `progress` counts revolutions (0, 1, 2, ...).
 *     It is driven by ONE long linear withTiming and never resets.
 *   - All geometry is periodic with period 1, so the motion loops
 *     seamlessly by construction (no per-cycle reset event exists).
 *   - Changing `speed` restarts the timing from the CURRENT value, which
 *     only changes the slope (speed) — no jump, no lost phase.
 *
 * No dependencies beyond react-native-svg and react-native-reanimated.
 */

import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

/* ===================================================================== */
/* 1. Tuning constants                                                   */
/* All lengths are in view-box units. The loader is drawn inside a       */
/* 100 x 100 viewBox and scaled to `size`, so every value below is       */
/* resolution-independent. Tweak these to match your reference video.    */
/*                                                                       */
/* Keep the max extent inside the box:                                   */
/*   SEMI_MAJOR + (HEAD_GLOW_DIAMETER / 2) * DEPTH_MAX_SCALE <= 50       */
/* (currently 36 + 10 * 1.18 = 47.8 — safe).                            */
/* ===================================================================== */

const VIEWBOX = 100;
const CENTER = VIEWBOX / 2;
const TWO_PI = Math.PI * 2;

/** Ellipse semi-axes (view-box units). Bigger ratio = flatter orbit. */
const SEMI_MAJOR = 36;
const SEMI_MINOR = 14.5;

/** Rotation of the whole orbit in degrees. Negative = leans up-right. */
const TILT_DEG = -24;
const TILT_RAD = (TILT_DEG * Math.PI) / 180;
const COS_TILT = Math.cos(TILT_RAD);
const SIN_TILT = Math.sin(TILT_RAD);

/** 1 = head moves clockwise (screen sense), -1 = counter-clockwise. */
const ORBIT_DIRECTION = 1;

/** Comet head layer diameters (view-box units). */
const HEAD_DIAMETER = 9.2;
const HEAD_MID_DIAMETER = 13.6;
const HEAD_GLOW_DIAMETER = 20;

/** Central nucleus. */
const CORE_DIAMETER = 6.4;
const CORE_SCALE_AMPLITUDE = 0.28;
const CORE_MIN_OPACITY = 0.45;
const CORE_MAX_OPACITY = 0.95;
/**
 * One full breath every 0.8 revolutions — slightly out of phase with the
 * orbit on purpose, so the loop doesn't feel mechanically locked.
 */
const CORE_BREATH_REVOLUTIONS = 0.8;

/** Fake depth: dots shrink + fade on the far side of the orbit. */
const DEPTH_MIN_SCALE = 0.55;
const DEPTH_MAX_SCALE = 1.18;
const DEPTH_MIN_OPACITY = 0.35;
const DEPTH_MAX_OPACITY = 1;

/** Track ellipse strokes. */
const TRACK_STROKE = 1.6;
const TRACK_OPACITY = 0.22;
const TRACK_HALO_STROKE = 3.6;
const TRACK_HALO_OPACITY = 0.07;

/**
 * Trail dots, trailing the head.
 * `lag`     — revolutions behind the head (0.045 rev ≈ 16 degrees).
 * `size`    — diameter as a fraction of the head diameter.
 * `opacity` — base opacity multiplier (before depth fading).
 */
const TRAIL: ReadonlyArray<{ lag: number; size: number; opacity: number }> = [
  { lag: 0.045, size: 0.78, opacity: 0.85 },
  { lag: 0.085, size: 0.6, opacity: 0.66 },
  { lag: 0.125, size: 0.46, opacity: 0.5 },
  { lag: 0.165, size: 0.34, opacity: 0.36 },
  { lag: 0.205, size: 0.25, opacity: 0.25 },
  { lag: 0.245, size: 0.17, opacity: 0.16 },
];

/** One revolution at speed = 1, in milliseconds. */
const BASE_ORBIT_MS = 2200;

/**
 * The single timing animation covers this many revolutions. The value
 * only ever grows; geometry wraps it modulo 1, so the motion never
 * visibly resets. 1,000,000 revolutions at 2200 ms ≈ 25 days of
 * continuous playback — effectively endless for a loader.
 */
const ANIMATION_HORIZON_REVOLUTIONS = 1_000_000;

/* ===================================================================== */
/* 2. Static orbit path (computed once per app load)                     */
/* NOTE: this must use the same maths as `orbitOffset` below. They share */
/* the constants above, so changing the ellipse/tilt automatically      */
/* updates both — just keep the two formulas identical.                 */
/* ===================================================================== */

function buildOrbitPath(): string {
  const steps = 64;
  let d = '';
  for (let i = 0; i <= steps; i += 1) {
    const theta = (i / steps) * TWO_PI;
    const ex = SEMI_MAJOR * Math.cos(theta);
    const ey = SEMI_MINOR * Math.sin(theta);
    const x = CENTER + ex * COS_TILT - ey * SIN_TILT;
    const y = CENTER + ex * SIN_TILT + ey * COS_TILT;
    d += `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return `${d}Z`;
}

const ORBIT_PATH = buildOrbitPath();

/* ===================================================================== */
/* 3. Worklet maths                                                      */
/* ===================================================================== */

/**
 * Offset (from the loader's centre) of a dot that is `lag` revolutions
 * behind the comet head at animation time `t`, scaled by `unit` px per
 * view-box unit. `depth` is 0 on the far side of the orbit and 1 on the
 * near side. Depth is derived from the UNSIGNED phase, so it depends on
 * WHERE the dot is, not on the travel direction.
 */
function orbitOffset(
  t: number,
  lag: number,
  unit: number,
): { x: number; y: number; depth: number } {
  'worklet';
  const raw = (t - lag) * TWO_PI;
  const theta = raw * ORBIT_DIRECTION;
  const ex = SEMI_MAJOR * Math.cos(theta);
  const ey = SEMI_MINOR * Math.sin(theta);
  return {
    x: (ex * COS_TILT - ey * SIN_TILT) * unit,
    y: (ex * SIN_TILT + ey * COS_TILT) * unit,
    depth: (Math.sin(raw) + 1) / 2,
  };
}

/* ===================================================================== */
/* 4. One animated dot (used for the head and every trail dot)           */
/* ===================================================================== */

type OrbitDotProps = {
  /** Shared animation clock, in revolutions. Only grows. */
  progress: SharedValue<number>;
  /** Revolutions this dot lags behind the head (0 = the head itself). */
  lag: number;
  /** Dot diameter in px before depth scaling. */
  diameterPx: number;
  /** Base opacity multiplier (0-1) before depth scaling. */
  fade: number;
  /** px per view-box unit — keeps the dot on the track at any `size`. */
  unit: number;
  color: string;
  /** Optional layered children — used for the glowing comet head. */
  children?: React.ReactNode;
};

function OrbitDot({
  progress,
  lag,
  diameterPx,
  fade,
  unit,
  color,
  children,
}: OrbitDotProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const p = orbitOffset(progress.value, lag, unit);
    const scale =
      DEPTH_MIN_SCALE + (DEPTH_MAX_SCALE - DEPTH_MIN_SCALE) * p.depth;
    const opacity =
      fade *
      (DEPTH_MIN_OPACITY + (DEPTH_MAX_OPACITY - DEPTH_MIN_OPACITY) * p.depth);
    return {
      opacity,
      transform: [{ translateX: p.x }, { translateY: p.y }, { scale }],
    };
  }, [progress, lag, fade, unit]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.dotAnchor,
        {
          width: diameterPx,
          height: diameterPx,
          marginLeft: -diameterPx / 2,
          marginTop: -diameterPx / 2,
        },
        animatedStyle,
      ]}
    >
      {children ?? (
        <View
          style={[
            StyleSheet.absoluteFill,
            { borderRadius: diameterPx / 2, backgroundColor: color },
          ]}
        />
      )}
    </Animated.View>
  );
}

/* ===================================================================== */
/* 5. Public component                                                   */
/* ===================================================================== */

export type CometOrbitLoaderProps = {
  /**
   * Outer width & height of the loader in dp. Everything scales with it,
   * and changing it does NOT restart or distort the animation.
   * Default: 160.
   */
  size?: number;
  /**
   * Speed multiplier for the whole animation.
   * 1 = default pace, 2 = twice as fast, 0.5 = half speed.
   * Zero, negative, NaN and Infinity all fall back to 1.
   * Default: 1.
   */
  speed?: number;
  /**
   * Accent colour used for the comet, trail, track and nucleus.
   * Default: '#38BDF8'.
   */
  color?: string;
  /** Optional style for the outer container (e.g. margins). */
  style?: StyleProp<ViewStyle>;
};

const DEFAULT_SIZE = 160;
const DEFAULT_SPEED = 1;
const DEFAULT_COLOR = '#38BDF8';

export default function CometOrbitLoader({
  size = DEFAULT_SIZE,
  speed = DEFAULT_SPEED,
  color = DEFAULT_COLOR,
  style,
}: CometOrbitLoaderProps) {
  const safeSize = Number.isFinite(size) && size > 0 ? size : DEFAULT_SIZE;
  const safeSpeed =
    Number.isFinite(speed) && speed > 0 ? speed : DEFAULT_SPEED;

  /** px per view-box unit — the single source of scaling. */
  const unit = safeSize / VIEWBOX;

  /** Animation clock in revolutions. Grows forever, never resets. */
  const progress = useSharedValue(0);

  useEffect(() => {
    const revolutionMs = BASE_ORBIT_MS / safeSpeed;
    // One very long linear timing. withTiming() always starts from the
    // CURRENT value of the shared value, so:
    //   - first mount:  0 -> horizon
    //   - speed change: current -> current + horizon (only the slope
    //     changes — no positional jump, no lost phase)
    // Geometry wraps the value modulo 1 revolution, so motion is
    // periodic without any reset event.
    progress.value = withTiming(
      progress.value + ANIMATION_HORIZON_REVOLUTIONS,
      {
        duration: ANIMATION_HORIZON_REVOLUTIONS * revolutionMs,
        easing: Easing.linear,
      },
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [safeSpeed, progress]);

  /**
   * Breathing nucleus — derived from the same clock with a cosine, so it
   * needs no animation of its own, needs no cleanup, and automatically
   * follows `speed` changes.
   */
  const coreStyle = useAnimatedStyle(() => {
    const phase = (progress.value / CORE_BREATH_REVOLUTIONS) % 1;
    const wave = 0.5 - 0.5 * Math.cos(phase * TWO_PI); // 0 -> 1 -> 0
    return {
      opacity: CORE_MIN_OPACITY + (CORE_MAX_OPACITY - CORE_MIN_OPACITY) * wave,
      transform: [{ scale: 1 + CORE_SCALE_AMPLITUDE * wave }],
    };
  }, [progress]);

  const headGlowPx = HEAD_GLOW_DIAMETER * unit;
  const headMidPx = HEAD_MID_DIAMETER * unit;
  const headCorePx = HEAD_DIAMETER * unit;
  const corePx = CORE_DIAMETER * unit;

  return (
    <View
      accessibilityLabel="Loading"
      accessibilityRole="progressbar"
      pointerEvents="none"
      style={[{ width: safeSize, height: safeSize }, style]}
    >
      {/* Faint tilted elliptical track (static, computed once). */}
      <Svg
        width={safeSize}
        height={safeSize}
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
      >
        <Path
          d={ORBIT_PATH}
          fill="none"
          stroke={color}
          strokeWidth={TRACK_HALO_STROKE}
          strokeOpacity={TRACK_HALO_OPACITY}
          strokeLinejoin="round"
        />
        <Path
          d={ORBIT_PATH}
          fill="none"
          stroke={color}
          strokeWidth={TRACK_STROKE}
          strokeOpacity={TRACK_OPACITY}
          strokeLinejoin="round"
        />
      </Svg>

      {/* Fading trail behind the comet head. */}
      {TRAIL.map((dot) => (
        <OrbitDot
          key={dot.lag}
          progress={progress}
          lag={dot.lag}
          diameterPx={HEAD_DIAMETER * unit * dot.size}
          fade={dot.opacity}
          unit={unit}
          color={color}
        />
      ))}

      {/* Glowing comet head (three stacked translucent discs). */}
      <OrbitDot
        progress={progress}
        lag={0}
        diameterPx={headGlowPx}
        fade={1}
        unit={unit}
        color={color}
      >
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: headGlowPx / 2,
              backgroundColor: color,
              opacity: 0.13,
            },
          ]}
        />
        <View
          style={[
            styles.centeredLayer,
            {
              width: headMidPx,
              height: headMidPx,
              marginLeft: -headMidPx / 2,
              marginTop: -headMidPx / 2,
              borderRadius: headMidPx / 2,
              backgroundColor: color,
              opacity: 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.centeredLayer,
            {
              width: headCorePx,
              height: headCorePx,
              marginLeft: -headCorePx / 2,
              marginTop: -headCorePx / 2,
              borderRadius: headCorePx / 2,
              backgroundColor: color,
            },
          ]}
        />
      </OrbitDot>

      {/* Breathing nucleus at the centre. */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.centeredLayer,
          {
            width: corePx,
            height: corePx,
            marginLeft: -corePx / 2,
            marginTop: -corePx / 2,
            borderRadius: corePx / 2,
            backgroundColor: color,
          },
          coreStyle,
        ]}
      />
    </View>
  );
}

/* Anchors a dot's centre to the loader's centre. Negative margins pull */
/* each dot back by half its own size so it is perfectly centred before */
/* the translate/scale transforms are applied.                          */
const styles = StyleSheet.create({
  dotAnchor: { position: 'absolute', left: '50%', top: '50%' },
  centeredLayer: { position: 'absolute', left: '50%', top: '50%' },
});