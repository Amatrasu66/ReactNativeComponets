/**
 * ParticleWaveLoader (Loader V3)
 * ----------------------------------------------------------------------------
 * A polar-grid dot-matrix loader inspired by the screen recording supplied
 * by the user. Three concentric rings of small dots form a C-shape (≈270°
 * arc). A brightness wave with a sharp leading head and a long gradual tail
 * sweeps clockwise through the grid at a constant angular velocity.
 *
 * Rendering tech:
 *   - react-native-svg <Circle> for each dot (crisp vector circles)
 *   - react-native-reanimated SharedValue for the global phase angle
 *   - one useDerivedValue + useAnimatedProps per dot, all driven by the SAME
 *     phase SharedValue, so the whole animation lives on the UI thread and
 *     does not trigger React re-renders.
 *
 * No new dependencies required: only `react-native-svg` and
 * `react-native-reanimated` (both already in the project).
 */

import React, { useEffect, useMemo } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

/* -------------------------------------------------------------------------- */
/* Public types                                                               */
/* -------------------------------------------------------------------------- */

export type ParticleWaveLoaderProps = {
  /** Overall loader diameter in pixels. Default 96. */
  size?: number;
  /**
   * Speed multiplier. 1.0 ≈ 2.0 s per full rotation.
   * Values ≤ 0 freeze the animation. Default 1.
   */
  speed?: number;
  /** Radius of each dot in pixels. Default 2.4. */
  dotRadius?: number;
  /** Number of concentric rings. Default 3. */
  rings?: number;
  /** Dot count on the OUTER ring. Inner rings scale with circumference. Default 22. */
  outerRingDots?: number;
  /** Angular extent of the dot grid in radians. π * 1.5 = 270° C-shape. Default 1.5π. */
  arcSpan?: number;
  /** Direction the C-shape opens toward, in radians. 0 = right. Default 0. */
  gapAngle?: number;
  /** Wave falloff exponent. 1 = soft symmetric cosine, 3 = sharper head. Default 2. */
  falloff?: number;
  /** Wave travel direction. +1 = clockwise, -1 = counter-clockwise. Default +1. */
  direction?: 1 | -1;
  /** Dot color (any valid SVG color string). Default '#FFFFFF'. */
  color?: string;
  /** Minimum dot opacity (creates the dim-grid look behind the wave). Default 0.08. */
  baseOpacity?: number;
  /** Optional container style. */
  style?: StyleProp<ViewStyle>;
};

/* -------------------------------------------------------------------------- */
/* Defaults                                                                    */
/* -------------------------------------------------------------------------- */

const DEFAULTS = {
  size: 96,
  speed: 1,
  dotRadius: 2.4,
  rings: 3,
  outerRingDots: 22,
  arcSpan: Math.PI * 1.5, // 270° C-shape
  gapAngle: 0, // gap opens to the right (toward companion text)
  falloff: 2,
  direction: 1 as const,
  color: '#FFFFFF',
  baseOpacity: 0.08,
};

const TWO_PI = Math.PI * 2;
// Base cycle duration in ms. speed=1 → 2000ms per full rotation.
const BASE_CYCLE_MS = 2000;

/* -------------------------------------------------------------------------- */
/* Dot layout                                                                  */
/* -------------------------------------------------------------------------- */

export type Dot = {
  cx: number;
  cy: number;
  r: number;
  /** Absolute angle of the dot, measured clockwise from +x axis. */
  angle: number;
};

/**
 * Build the dot grid: `rings` concentric layers of evenly-spaced dots,
 * staggered by half a step on every other ring so dots don't form visible
 * radial spokes. Dots only exist within the arc span (the C-shape gap is
 * empty).
 */
function generateDots(opts: {
  size: number;
  rings: number;
  outerRingDots: number;
  dotRadius: number;
  arcSpan: number;
  gapAngle: number;
}): Dot[] {
  const { size, rings, outerRingDots, dotRadius, arcSpan, gapAngle } = opts;

  // Reserve a little margin so the outer dots don't clip at the box edge.
  const outerRadius = size / 2 - dotRadius - 1;
  // Inner ring sits at ~32% of the outer radius — leaves a small hole in the
  // middle so the silhouette reads as a ring cluster, not a solid disk.
  const innerRadius = outerRadius * 0.32;
  const center = size / 2;

  // The gap is centered on `gapAngle`. Dots live on the opposite arc.
  const gapHalf = (TWO_PI - arcSpan) / 2;
  const startAngle = gapAngle + gapHalf;

  const dots: Dot[] = [];

  for (let ring = 0; ring < rings; ring++) {
    // Linear interpolation between inner and outer radius.
    const t = rings === 1 ? 0 : ring / (rings - 1);
    const radius = innerRadius + (outerRadius - innerRadius) * t;

    // Scale dot count with circumference so density stays roughly constant.
    const ringDots = Math.max(6, Math.round(outerRingDots * (radius / outerRadius)));

    // Stagger every other ring by half a step (polar offset, not cartesian).
    const offset = (ring % 2) * (arcSpan / ringDots / 2);

    for (let i = 0; i < ringDots; i++) {
      const a = startAngle + offset + (i * arcSpan) / ringDots;
      dots.push({
        cx: center + radius * Math.cos(a),
        cy: center + radius * Math.sin(a),
        r: dotRadius,
        angle: a,
      });
    }
  }

  return dots;
}

/* -------------------------------------------------------------------------- */
/* Animated dot                                                                 */
/* -------------------------------------------------------------------------- */

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type AnimatedDotProps = {
  cx: number;
  cy: number;
  r: number;
  fill: string;
  angle: number;
  phase: SharedValue<number>;
  direction: 1 | -1;
  falloff: number;
  baseOpacity: number;
};

/**
 * A single dot whose opacity is derived on the UI thread from the global
 * `phase` SharedValue. Because `phase` is a stable object reference passed
 * by the parent, this component never re-renders when the phase changes —
 * only the worklet re-runs. The component is wrapped in `React.memo` so a
 * parent re-render (e.g. when `size` changes) also avoids touching dots
 * whose primitive props have not changed.
 */
const AnimatedDot = React.memo<AnimatedDotProps>(function AnimatedDot({
  cx,
  cy,
  r,
  fill,
  angle,
  phase,
  direction,
  falloff,
  baseOpacity,
}: AnimatedDotProps) {
  const opacity = useDerivedValue(() => {
    'worklet';

    // Signed angular difference between this dot and the current phase.
    let diff = angle - phase.value * direction;
    // Normalize to [-π, π].
    diff = ((diff % TWO_PI) + TWO_PI) % TWO_PI;
    if (diff > Math.PI) diff -= TWO_PI;

    // Symmetric cosine falloff. cos(0)=1 (brightest), cos(±π/2)=0 (invisible).
    const c = Math.cos(diff);
    if (c <= 0) return baseOpacity;
    const wave = Math.pow(c, falloff);
    return baseOpacity + (1 - baseOpacity) * wave;
  });

  const animatedProps = useAnimatedProps(
    () => ({ opacity: opacity.value }) as { opacity: number },
  );

  return (
    <AnimatedCircle
      cx={cx}
      cy={cy}
      r={r}
      fill={fill}
      animatedProps={animatedProps}
    />
  );
});

/* -------------------------------------------------------------------------- */
/* Main component                                                               */
/* -------------------------------------------------------------------------- */

export const ParticleWaveLoader: React.FC<ParticleWaveLoaderProps> = (props) => {
  const {
    size,
    speed,
    dotRadius,
    rings,
    outerRingDots,
    arcSpan,
    gapAngle,
    falloff,
    direction,
    color,
    baseOpacity,
    style,
  } = { ...DEFAULTS, ...props };

  // Single source of truth for the wave head. 0 → 2π = one full revolution.
  const phase = useSharedValue(0);

  useEffect(() => {
    if (!Number.isFinite(speed) || speed <= 0) {
      // Invalid speed: stop cleanly and park at phase 0 so the grid is at
      // rest instead of frozen mid-flight.
      cancelAnimation(phase);
      phase.value = 0;
      return;
    }

    const cycleDuration = BASE_CYCLE_MS / speed;
    cancelAnimation(phase);
    phase.value = 0;
    // Linear timing → constant angular velocity (matches the reference video).
    // Infinite repeat, no reverse, no easing variation across cycles.
    phase.value = withRepeat(
      withTiming(TWO_PI, {
        duration: cycleDuration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );

    return () => {
      cancelAnimation(phase);
    };
  }, [speed, phase]);

  // Re-generate the dot grid only when geometry inputs change.
  const dots = useMemo(
    () =>
      generateDots({
        size,
        rings,
        outerRingDots,
        dotRadius,
        arcSpan,
        gapAngle,
      }),
    [size, rings, outerRingDots, dotRadius, arcSpan, gapAngle],
  );

  return (
    <View
      style={[{ width: size, height: size }, style]}
      pointerEvents="none"
    >
      <Svg width={size} height={size}>
        {dots.map((d, i) => (
          <AnimatedDot
            key={i}
            cx={d.cx}
            cy={d.cy}
            r={d.r}
            fill={color}
            angle={d.angle}
            phase={phase}
            direction={direction}
            falloff={falloff}
            baseOpacity={baseOpacity}
          />
        ))}
      </Svg>
    </View>
  );
};

/**
 * Alias used by the project's showcase convention
 * (LoaderV1, LoaderV2, LoaderV3…).
 */
export const LoaderV3 = ParticleWaveLoader;

export default ParticleWaveLoader;