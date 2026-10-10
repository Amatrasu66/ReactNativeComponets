import React, { useState } from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Slider from '@react-native-community/slider';
import { Link } from 'expo-router';

import { LoaderV2 } from '../../loaders/v2';

export default function IndexV2() {
  const [size, setSize] = useState(180);
  const [speed, setSpeed] = useState(1);
  const [reverse, setReverse] = useState(false);
  const [dotScale, setDotScale] = useState(1);
  const [particleCount, setParticleCount] = useState(90);
  const [tilt, setTilt] = useState(0.28);
  const [opacity, setOpacity] = useState(1);
  const [swirl, setSwirl] = useState(0.25);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Navigation Switcher */}
        <View style={styles.navRow}>
          <Link href="/" style={styles.navTab}>
            <Text style={styles.navTextInactive}>← Switch to V1</Text>
          </Link>
          <View style={[styles.navTab, styles.navTabActive]}>
            <Text style={styles.navTextActive}>V2 Showcase</Text>
          </View>
          <Link href="/v2" style={styles.navTab}>
            <Text style={styles.navTextInactive}>Isolated Screen ↗</Text>
          </Link>
        </View>

        {/* Loader Preview */}
        <View style={styles.loaderContainer}>
          <LoaderV2
            size={size}
            speed={speed}
            reverse={reverse}
            dotScale={dotScale}
            particleCount={particleCount}
            tilt={tilt}
            opacity={opacity}
            swirl={swirl}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>
              Thinking Orbs Controls
            </Text>

            <Text style={styles.modeText}>
              {reverse ? 'Reverse' : 'Forward'} — {(3 / speed).toFixed(1)}s loop
            </Text>
          </View>

          {/* 1. Rotation Reverse Toggle Button */}
          <View style={styles.control}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.label}>Rotation Direction</Text>
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

          {/* 2. Orb Diameter Size */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Orb Sphere Size (Diameter)
              </Text>

              <Text style={styles.value}>
                {Math.round(size)}px
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={80}
              maximumValue={280}
              step={4}
              value={size}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSize}
            />
          </View>

          {/* 3. Dot Size Control Slider */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Individual Dot Size
              </Text>

              <Text style={styles.value}>
                {dotScale.toFixed(2)}x ({(3.2 * (size / 120) * dotScale).toFixed(1)}px)
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.4}
              maximumValue={2.2}
              step={0.05}
              value={dotScale}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setDotScale}
            />
          </View>

          {/* 4. Number of Dots (Particle Count) */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Number of Dots (Density)
              </Text>

              <Text style={styles.value}>
                {particleCount} dots
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={24}
              maximumValue={200}
              step={2}
              value={particleCount}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setParticleCount}
            />
          </View>

          {/* 5. Spin Speed Slider */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Spin Speed
              </Text>

              <Text style={styles.value}>
                {speed.toFixed(2)}x ({(3 / speed).toFixed(1)}s/loop)
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.25}
              maximumValue={2.5}
              step={0.05}
              value={speed}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSpeed}
            />
          </View>

          {/* 6. Tilt Control Slider */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Axis Tilt Angle
              </Text>

              <Text style={styles.value}>
                {((tilt * 180) / Math.PI).toFixed(0)}° ({tilt.toFixed(2)} rad)
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={-0.8}
              maximumValue={0.8}
              step={0.02}
              value={tilt}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setTilt}
            />
          </View>

          {/* 7. Opacity Slider for Dots */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Dot Brightness / Opacity
              </Text>

              <Text style={styles.value}>
                {Math.round(opacity * 100)}%
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.2}
              maximumValue={1.0}
              step={0.05}
              value={opacity}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setOpacity}
            />
          </View>

          {/* 8. Swirl / Vortex Amplitude Slider */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Vortex Swirl Amplitude
              </Text>

              <Text style={styles.value}>
                {swirl.toFixed(2)}
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={0.8}
              step={0.05}
              value={swirl}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSwirl}
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
    minHeight: 360,
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
