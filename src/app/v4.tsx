/**
 * V4 full-screen preview — route: /v4
 *
 * Mirrors the dedicated full-screen previews of V1 and V2: just the loader,
 * centered on a dark stage, running at its reference defaults (size 240 for
 * visibility). Tap anywhere to cycle the speed multiplier:
 * 1× (reference) → 2× → 0.5×. Changing speed restarts the sweep from its
 * reference start phase — deterministic, no mid-pulse jump-cuts.
 *
 * This screen is fully independent of the V1 and V2 screens: it imports
 * nothing from loaders/v1, loaders/v2, src/app/index, index-v2, v1 or v2.
 *
 * Uses only React Native core components — no extra dependencies.
 */

import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CometOrbitLoader } from '../../loaders/v4';

const SPEED_PRESETS = [
  { label: '1× (reference)', value: 1 },
  { label: '2×', value: 2 },
  { label: '0.5×', value: 0.5 },
] as const;

export default function V4Screen() {
  const [preset, setPreset] = useState(0);
  const speed = SPEED_PRESETS[preset].value;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBar}>
        <Link href="/index-v4" style={styles.topLink}>
          ← Showcase &amp; controls
        </Link>
      </View>

      <Pressable
        style={styles.stage}
        onPress={() => setPreset((next) => (next + 1) % SPEED_PRESETS.length)}
        accessibilityLabel="Change loader speed"
        accessibilityRole="button"
      >
        <CometOrbitLoader size={240} speed={speed} />
        <Text style={styles.hint}>
          tap to change speed · {SPEED_PRESETS[preset].label}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0E',
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  topLink: {
    fontSize: 15,
    color: '#7FB4FF',
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  hint: {
    fontSize: 13,
    color: '#8E8E96',
  },
});