/**
 * Loader V3 showcase screen.
 *
 * Recreates the look of the reference video: a dark rounded "pill"
 * containing the particle-wave loader on the left and the "Listening…"
 * label on the right. Adds Size and Speed sliders so the user can probe
 * the loader's behaviour without leaving the screen.
 *
 * This screen does NOT import V1 or V2 — V3 is fully isolated.
 */

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { LoaderV3 } from '../../loaders/v3';

export default function IndexV3Screen() {
  const [size, setSize] = useState(120);
  const [speed, setSpeed] = useState(1);

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Loader V3</Text>
        <Text style={styles.subtitle}>Particle Wave Loader</Text>
      </View>

      <View style={styles.stage}>
        <View style={styles.pill}>
          <LoaderV3 size={size} speed={speed} />
          <Text style={styles.listeningText}>Listening…</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.control}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Size</Text>
            <Text style={styles.controlValue}>{size.toFixed(0)} px</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={48}
            maximumValue={240}
            step={4}
            value={size}
            onValueChange={setSize}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#3A3A3C"
            thumbTintColor="#FFFFFF"
          />
        </View>

        <View style={styles.control}>
          <View style={styles.controlHeader}>
            <Text style={styles.controlLabel}>Speed</Text>
            <Text style={styles.controlValue}>{speed.toFixed(2)}×</Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={3}
            step={0.05}
            value={speed}
            onValueChange={setSpeed}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#3A3A3C"
            thumbTintColor="#FFFFFF"
          />
        </View>
      </View>

      <Text style={styles.footnote}>
        3 rings · 270° arc · cosine opacity wave · linear rotation
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  subtitle: {
    color: '#9E9E9E',
    fontSize: 13,
    marginTop: 4,
    letterSpacing: 0.3,
  },
  stage: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 999,
    paddingVertical: 18,
    paddingHorizontal: 28,
    gap: 18,
  },
  listeningText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
  controls: {
    width: '100%',
    maxWidth: 360,
    gap: 22,
  },
  control: {
    gap: 8,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  controlLabel: {
    color: '#CCCCCC',
    fontSize: 13,
    fontWeight: '600',
  },
  controlValue: {
    color: '#9E9E9E',
    fontSize: 13,
    fontVariant: ['tabular-nums'],
  },
  slider: {
    width: '100%',
    height: 36,
  },
  footnote: {
    color: '#5A5A5C',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
