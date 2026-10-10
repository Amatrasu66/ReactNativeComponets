/**
 * src/app/index-v4.tsx
 * Showcase screen for Loader V4 — CometOrbitLoader.
 * Route: /index-v4
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoaderV4 } from '../../loaders/v4';

const ACCENT = '#38BDF8';

export default function LoaderV4Showcase() {
  const insets = useSafeAreaInsets();
  const [size, setSize] = useState(160);
  const [speed, setSpeed] = useState(1);

  return (
    <View
      style={[
        styles.screen,
        {
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 16,
        },
      ]}
    >
      <Text style={styles.title}>Loader V4 · Comet Orbit</Text>
      <Text style={styles.subtitle}>
        react-native-svg + Reanimated · no new dependencies
      </Text>

      <View style={styles.stage}>
        <LoaderV4 size={size} speed={speed} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.label}>Size — {Math.round(size)} dp</Text>
        <Slider
          minimumValue={80}
          maximumValue={320}
          step={10}
          value={size}
          onValueChange={setSize}
          minimumTrackTintColor={ACCENT}
          maximumTrackTintColor="#24324B"
          thumbTintColor={ACCENT}
        />
        <Text style={styles.label}>Speed — {speed.toFixed(2)}×</Text>
        <Slider
          minimumValue={0.25}
          maximumValue={3}
          step={0.25}
          value={speed}
          onValueChange={setSpeed}
          minimumTrackTintColor={ACCENT}
          maximumTrackTintColor="#24324B"
          thumbTintColor={ACCENT}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220',
    paddingHorizontal: 20,
  },
  title: {
    color: '#E8EEF9',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  subtitle: {
    color: '#7C8DB0',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    gap: 4,
  },
  label: {
    color: '#AEBDD9',
    fontSize: 14,
    marginBottom: 2,
  },
});