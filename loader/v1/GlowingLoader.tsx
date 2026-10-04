import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import Svg, {
  Defs,
  LinearGradient,
  Path,
  Stop,
} from 'react-native-svg';

import Animated, {
  Easing,
  useAnimatedProps,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface GlowingLoaderProps {
  size?: number;
  duration?: number;
  speed?: number;
  range?: number;
  phaseOffset?: number;
}

/**
 * Builds the animated ripple path.
 *
 * Important:
 * This is shared by EVERY animated layer so that the
 * trail/profile/diffuse glow all sit on the exact same geometry.
 */
const buildRipplePath = (
  progress: number,
  size: number,
  baseRadius: number,
  center: number,
  speed: number,
  range: number,
  phaseOffset: number,
) => {
  'worklet';

  const N = 96;

  const phase =
    progress * Math.PI * 2 +
    phaseOffset;

  const points: {
    x: number;
    y: number;
  }[] = [];

  const rippleFreq = Math.max(
    1,
    Math.round(3.5 * speed),
  );

  for (let i = 0; i < N; i++) {
    const angle =
      (i / N) * Math.PI * 2;

    let delta =
      angle - phase;

    delta = Math.atan2(
      Math.sin(delta),
      Math.cos(delta),
    );

    const maxSpread =
      Math.PI *
      0.22 *
      Math.max(0.1, range);

    let waveEnvelope = 0;

    if (Math.abs(delta) < maxSpread) {
      const normalized =
        delta / maxSpread;

      waveEnvelope = Math.pow(
        Math.cos(
          normalized *
            (Math.PI / 2),
        ),
        2.5,
      );
    }

    const ripple =
      Math.sin(
        angle * rippleFreq -
          phase * 3,
      ) *
        0.6 +
      Math.cos(
        angle * 2 +
          phase * 2,
      ) *
        0.4;

    const radius =
      baseRadius +
      ripple *
        waveEnvelope *
        (size * 0.048);

    points.push({
      x:
        center +
        radius *
          Math.cos(angle),

      y:
        center +
        radius *
          Math.sin(angle),
    });
  }

  let d =
    `M ${points[0].x.toFixed(2)} ` +
    `${points[0].y.toFixed(2)}`;

  const tension = 0.3;

  for (let i = 0; i < N; i++) {
    const p0 =
      points[
        (i - 1 + N) % N
      ];

    const p1 = points[i];

    const p2 =
      points[
        (i + 1) % N
      ];

    const p3 =
      points[
        (i + 2) % N
      ];

    const cp1x =
      p1.x +
      (p2.x - p0.x) *
        tension;

    const cp1y =
      p1.y +
      (p2.y - p0.y) *
        tension;

    const cp2x =
      p2.x -
      (p3.x - p1.x) *
        tension;

    const cp2y =
      p2.y -
      (p3.y - p1.y) *
        tension;

    d +=
      ` C ${cp1x.toFixed(2)} ` +
      `${cp1y.toFixed(2)}, ` +
      `${cp2x.toFixed(2)} ` +
      `${cp2y.toFixed(2)}, ` +
      `${p2.x.toFixed(2)} ` +
      `${p2.y.toFixed(2)}`;
  }

  return `${d} Z`;
};

export const GlowingLoader = ({
  size = 290,
  duration = 5000,
  speed = 0.6,
  range = 2.5,
  phaseOffset = 1.6,
}: GlowingLoaderProps) => {
  const progress =
    useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    progress.value = withRepeat(
      withTiming(1, {
        duration,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [duration, progress]);

  /*
   * ============================================================
   * BASE GEOMETRY
   * ============================================================
   */

  const strokeWidth =
    size * 0.035;

  const baseRadius =
    (size - strokeWidth * 6) / 2;

  const center =
    size / 2;

  /*
   * Approximate circumference.
   *
   * The path is close enough to circular for the dash animation.
   */

  const perimeter =
    2 *
    Math.PI *
    baseRadius;

  /*
   * ============================================================
   * SHARED ANIMATED RIPPLE PATH
   * ============================================================
   *
   * This is the important fix.
   *
   * Every layer now receives:
   *
   *   d: ripplePath.value
   *
   * without this, the trail/profile has no geometry to draw.
   */

  const ripplePath =
    useDerivedValue(() => {
      return buildRipplePath(
        progress.value,
        size,
        baseRadius,
        center,
        speed,
        range,
        phaseOffset,
      );
    });

  /*
   * ============================================================
   * MAIN PATH
   * ============================================================
   */

  const animatedProps =
    useAnimatedProps(() => {
      return {
        d: ripplePath.value,
      };
    });

  /*
   * ============================================================
   * [1, 2, 2, 1] PROFILE
   * ============================================================
   */

  const PROFILE_COVERAGE =
    0.18;

  const profileLength =
    perimeter *
    PROFILE_COVERAGE;

  const profileSection =
    profileLength / 4;

  /*
   * PROFILE 1 — [1]
   */

  const profile1Props =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          profileSection,
          perimeter -
            profileSection,
        ],

        strokeDashoffset:
          -offset,
      };
    });

  /*
   * PROFILE 2 — [2]
   */

  const profile2Props =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          profileSection,
          perimeter -
            profileSection,
        ],

        strokeDashoffset:
          -offset -
          profileSection,
      };
    });

  /*
   * PROFILE 3 — [2]
   */

  const profile3Props =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          profileSection,
          perimeter -
            profileSection,
        ],

        strokeDashoffset:
          -offset -
          profileSection * 2,
      };
    });

  /*
   * PROFILE 4 — [1]
   */

  const profile4Props =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          profileSection,
          perimeter -
            profileSection,
        ],

        strokeDashoffset:
          -offset -
          profileSection * 3,
      };
    });

  /*
   * ============================================================
   * MOVING TRAIL
   * ============================================================
   *
   * The trail is deliberately shorter than the profile.
   *
   * Outer  -> soft wide halo
   * Inner  -> brighter body
   * Tip    -> sharp bright end
   */

  const TRAIL_OUTER_LENGTH =
    perimeter * 0.075;

  const TRAIL_INNER_LENGTH =
    perimeter * 0.042;

  const TRAIL_TIP_LENGTH =
    perimeter * 0.018;

  /*
   * Small separation between the profile and trail.
   */

  const TRAIL_GAP =
    profileLength * 0.10;

  /*
   * ------------------------------------------------------------
   * OUTER TRAIL
   * ------------------------------------------------------------
   */

  const trailOuterProps =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          TRAIL_OUTER_LENGTH,
          perimeter -
            TRAIL_OUTER_LENGTH,
        ],

        strokeDashoffset:
          -offset +
          profileLength +
          TRAIL_GAP,
      };
    });

  /*
   * ------------------------------------------------------------
   * INNER TRAIL
   * ------------------------------------------------------------
   */

  const trailInnerProps =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          TRAIL_INNER_LENGTH,
          perimeter -
            TRAIL_INNER_LENGTH,
        ],

        strokeDashoffset:
          -offset +
          profileLength +
          TRAIL_GAP +
          TRAIL_OUTER_LENGTH * 0.25,
      };
    });

  /*
   * ------------------------------------------------------------
   * TRAIL TIP
   * ------------------------------------------------------------
   */

  const trailTipProps =
    useAnimatedProps(() => {
      const offset =
        progress.value *
        perimeter;

      return {
        d: ripplePath.value,

        strokeDasharray: [
          TRAIL_TIP_LENGTH,
          perimeter -
            TRAIL_TIP_LENGTH,
        ],

        strokeDashoffset:
          -offset +
          profileLength +
          TRAIL_GAP +
          TRAIL_OUTER_LENGTH * 0.45,
      };
    });

  /*
   * ============================================================
   * GLOW WIDTHS
   * ============================================================
   */

  const outerGlowWidth =
    strokeWidth +
    size * 0.035;

  const overGlowWidth =
    strokeWidth +
    size * 0.010;

  const glowUnit =
    size * 0.010;

  const profileWidth1 =
    glowUnit;

  const profileWidth2 =
    glowUnit * 2;

  /*
   * ============================================================
   * RENDER
   * ============================================================
   */

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
        },
      ]}
    >
      <Svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <Defs>
          <LinearGradient
            id="glowingGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <Stop
              offset="0%"
              stopColor="#FFFFFF"
              stopOpacity={1}
            />

            <Stop
              offset="50%"
              stopColor="#FFFFFF"
              stopOpacity={1}
            />

            <Stop
              offset="100%"
              stopColor="#FFFFFF"
              stopOpacity={1}
            />
          </LinearGradient>
        </Defs>

        {/* ======================================================
            LARGE DIFFUSE GLOW
            ====================================================== */}

        <AnimatedPath
          animatedProps={animatedProps}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={outerGlowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.22}
        />

        {/* ======================================================
            TRAIL — OUTER
            ====================================================== */}

        <AnimatedPath
          animatedProps={trailOuterProps}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={size * 0.032}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.28}
        />

        {/* ======================================================
            TRAIL — INNER
            ====================================================== */}

        <AnimatedPath
          animatedProps={trailInnerProps}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={size * 0.021}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.48}
        />

        {/* ======================================================
            TRAIL — TIP
            ====================================================== */}

        <AnimatedPath
          animatedProps={trailTipProps}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={size * 0.012}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.78}
        />

        {/* ======================================================
            [1] PROFILE
            ====================================================== */}

        <AnimatedPath
          animatedProps={profile1Props}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={profileWidth1}
          strokeLinecap="round"
          opacity={0.60}
        />

        {/* ======================================================
            [2] PROFILE
            ====================================================== */}

        <AnimatedPath
          animatedProps={profile2Props}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={profileWidth2}
          strokeLinecap="round"
          opacity={0.90}
        />

        {/* ======================================================
            [2] PROFILE
            ====================================================== */}

        <AnimatedPath
          animatedProps={profile3Props}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={profileWidth2}
          strokeLinecap="round"
          opacity={0.90}
        />

        {/* ======================================================
            [1] PROFILE
            ====================================================== */}

        <AnimatedPath
          animatedProps={profile4Props}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={profileWidth1}
          strokeLinecap="round"
          opacity={0.60}
        />

        {/* ======================================================
            TIGHT OVER-GLOW
            ====================================================== */}

        <AnimatedPath
          animatedProps={animatedProps}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={overGlowWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={1}
        />

        {/* ======================================================
            SHARP CORE
            ====================================================== */}

        <AnimatedPath
          animatedProps={animatedProps}
          fill="none"
          stroke="url(#glowingGradient)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={1}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});