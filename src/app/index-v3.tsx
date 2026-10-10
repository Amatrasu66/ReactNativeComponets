/**
 * Loader V3 showcase screen.
 *
 * Displays just the particle-wave loader animation (no header, no pill).
 * Full control panel with all sliders and toggles.
 *
 * This screen does NOT import V1 or V2 — V3 is fully isolated.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Link } from 'expo-router';
import { LoaderV3 } from '../../loaders/v3';

export default function IndexV3Screen() {
  const [size, setSize] = useState(180);
  const [speed, setSpeed] = useState(1);
  const [reverse, setReverse] = useState(false);
  const [dotRadius, setDotRadius] = useState(2.4);
  const [outerRingDots, setOuterRingDots] = useState(22);
  const [rings, setRings] = useState(3);
  const [opacity, setOpacity] = useState(1);
  const [falloff, setFalloff] = useState(2);
  const [baseOpacity, setBaseOpacity] = useState(0.08);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Switcher */}
        <View style={styles.navRow}>
          <Link href="/index-v2" style={styles.navTab}>
            <Text style={styles.navTextInactive}>← V2</Text>
          </Link>
          <View style={[styles.navTab, styles.navTabActive]}>
            <Text style={styles.navTextActive}>V3 Showcase</Text>
          </View>
          <Link href="/v3" style={styles.navTab}>
            <Text style={styles.navTextInactive}>Isolated ↗</Text>
          </Link>
        </View>

        {/* Loader Preview — just the animation, no text, no pill */}
        <View style={styles.loaderContainer}>
          <LoaderV3
            size={size}
            speed={speed}
            reverse={reverse}
            dotRadius={dotRadius}
            outerRingDots={outerRingDots}
            rings={rings}
            opacity={opacity}
            falloff={falloff}
            baseOpacity={baseOpacity}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>
              Particle Wave Controls
            </Text>
            <Text style={styles.modeText}>
              {reverse ? 'Reverse' : 'Forward'} — {(2 / speed).toFixed(1)}s loop
            </Text>
          </View>

          {/* 1. Rotation Reverse Toggle Button */}
          <View style={styles.control}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.label}>Wave Direction</Text>
                <Text style={styles.subLabel}>
                  {reverse ? 'Counter-clockwise (Reversed)' : 'Clockwise (Default)'}
                </Text>
              </View>

              <Pressable
                onPress={() => setReverse((prev) => !prev)}
                style={[styles.toggleBtn, reverse && styles.toggleBtnActive]}
              >
                <Text style={[styles.toggleBtnText, reverse && styles.toggleBtnTextActive]}>
                  {reverse ? '↺ Reverse' : '↻ Forward'}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* 2. Size */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Loader Size (Diameter)</Text>
              <Text style={styles.value}>{Math.round(size)}px</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={60}
              maximumValue={280}
              step={4}
              value={size}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSize}
            />
          </View>

          {/* 3. Dot Size Slider */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Dot Size (Radius)</Text>
              <Text style={styles.value}>{dotRadius.toFixed(1)}px</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={6}
              step={0.2}
              value={dotRadius}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setDotRadius}
            />
          </View>

          {/* 4. Number of Dots (Outer Ring) */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Dots Per Ring (Outer)</Text>
              <Text style={styles.value}>{outerRingDots} dots</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={8}
              maximumValue={40}
              step={1}
              value={outerRingDots}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setOuterRingDots}
            />
          </View>

          {/* 5. Number of Rings */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Number of Rings</Text>
              <Text style={styles.value}>{rings} rings</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={8}
              step={1}
              value={rings}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setRings}
            />
          </View>

          {/* 6. Speed */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Wave Speed</Text>
              <Text style={styles.value}>
                {speed.toFixed(2)}x ({(2 / speed).toFixed(1)}s/loop)
              </Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.2}
              maximumValue={3}
              step={0.05}
              value={speed}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSpeed}
            />
          </View>

          {/* 7. Dot Opacity */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Dot Brightness / Opacity</Text>
              <Text style={styles.value}>{Math.round(opacity * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.2}
              maximumValue={1}
              step={0.05}
              value={opacity}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setOpacity}
            />
          </View>

          {/* 8. Wave Sharpness (Falloff) */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Wave Sharpness (Falloff)</Text>
              <Text style={styles.value}>{falloff.toFixed(1)}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0.5}
              maximumValue={6}
              step={0.25}
              value={falloff}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setFalloff}
            />
          </View>

          {/* 9. Base Opacity (Dim Grid Behind Wave) */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Background Dot Visibility</Text>
              <Text style={styles.value}>{Math.round(baseOpacity * 100)}%</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={0.5}
              step={0.02}
              value={baseOpacity}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setBaseOpacity}
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 40,
  },

  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#18181B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    gap: 6,
  },

  navTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
  },

  navTabActive: {
    backgroundColor: '#18181B',
  },

  navTextActive: {
    color: '#FAFAFA',
    fontSize: 12,
    fontWeight: '600',
  },

  navTextInactive: {
    color: '#A1A1AA',
    fontSize: 12,
    fontWeight: '500',
  },

  loaderContainer: {
    width: '100%',
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
  },

  controls: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#09090B',
    borderWidth: 1,
    borderColor: '#18181B',
    borderRadius: 16,
    padding: 16,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#18181B',
  },

  headerText: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '600',
  },

  modeText: {
    color: '#71717A',
    fontSize: 11,
    fontWeight: '400',
  },

  control: {
    marginTop: 14,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    color: '#E4E4E7',
    fontSize: 12,
    fontWeight: '500',
    flexShrink: 1,
  },

  value: {
    color: '#A1A1AA',
    fontSize: 11,
    fontFamily: 'monospace',
    marginLeft: 10,
  },

  slider: {
    width: '100%',
    height: 30,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121215',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  subLabel: {
    color: '#71717A',
    fontSize: 10,
    marginTop: 2,
  },

  toggleBtn: {
    backgroundColor: '#27272A',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },

  toggleBtnActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },

  toggleBtnText: {
    color: '#D4D4D8',
    fontSize: 12,
    fontWeight: '600',
  },

  toggleBtnTextActive: {
    color: '#09090B',
    fontWeight: '700',
  },
});
