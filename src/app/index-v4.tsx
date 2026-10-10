/**
 * V4 showcase screen — route: /index-v4
 *
 * Renders Loader V4 ("Comet Orbit") at its reference defaults plus a small
 * control panel for the props it actually supports (size, speed, color).
 * This screen is fully independent of the V1 and V2 showcases: it imports
 * nothing from loaders/v1, loaders/v2, src/app/index, index-v2, v1 or v2.
 *
 * Uses only React Native core components — no extra dependencies.
 */

import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { CometOrbitLoader } from '../../loaders/v4';

const SIZE_OPTIONS = [96, 160, 240] as const;
const SPEED_OPTIONS = [0.5, 1, 2] as const;
const COLOR_OPTIONS = [
  { label: 'White', value: '#FFFFFF' },
  { label: 'Amber', value: '#FFC24B' },
  { label: 'Cyan', value: '#41D0FF' },
  { label: 'Rose', value: '#FF6B8B' },
] as const;

export default function IndexV4Screen() {
  const [size, setSize] = useState<number>(160);
  const [speed, setSpeed] = useState<number>(1);
  const [color, setColor] = useState<string>('#FFFFFF');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Loader V4 — Comet Orbit</Text>
      <Text style={styles.subtitle}>
        126 fixed stars · one comet of brightness · ~1.43 s per orbit
      </Text>

      {/* Main preview: the loader under test with the current controls. */}
      <View style={styles.stage}>
        <CometOrbitLoader size={size} speed={speed} color={color} />
      </View>

      {/* Size controls */}
      <Text style={styles.groupLabel}>Size</Text>
      <View style={styles.row}>
        {SIZE_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={`${option} dp`}
            active={size === option}
            onPress={() => setSize(option)}
          />
        ))}
      </View>

      {/* Speed controls */}
      <Text style={styles.groupLabel}>Speed</Text>
      <View style={styles.row}>
        {SPEED_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={option === 1 ? '1× (reference)' : `${option}×`}
            active={speed === option}
            onPress={() => setSpeed(option)}
          />
        ))}
      </View>

      {/* Color controls */}
      <Text style={styles.groupLabel}>Star color</Text>
      <View style={styles.row}>
        {COLOR_OPTIONS.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            active={color === option.value}
            onPress={() => setColor(option.value)}
          />
        ))}
      </View>

      {/* A second, always-default row: confirms the animation runs cleanly
          and independently per instance. */}
      <Text style={styles.groupLabel}>Reference defaults (always on)</Text>
      <View style={styles.miniRow}>
        <CometOrbitLoader />
        <CometOrbitLoader size={72} speed={1.75} color="#9B8CFF" />
      </View>

      <View style={styles.linkRow}>
        <Link href="/v4" style={styles.link}>
          Full-screen preview →
        </Link>
        <Link href="/" style={styles.link}>
          ← Back to loader menu
        </Link>
      </View>
    </ScrollView>
  );
}

/** A small rounded toggle button. */
function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#101014',
  },
  content: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F2F2F5',
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E96',
    marginBottom: 16,
  },
  stage: {
    width: 280,
    height: 280,
    borderRadius: 24,
    backgroundColor: '#1A1A20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  groupLabel: {
    alignSelf: 'flex-start',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E96',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    marginTop: 12,
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#1A1A20',
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#23232B',
    borderWidth: 1,
    borderColor: '#2E2E38',
  },
  chipActive: {
    backgroundColor: '#EAEAF0',
    borderColor: '#EAEAF0',
  },
  chipText: {
    fontSize: 13,
    color: '#B9B9C3',
  },
  chipTextActive: {
    color: '#101014',
    fontWeight: '600',
  },
  linkRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 28,
  },
  link: {
    fontSize: 15,
    color: '#7FB4FF',
  },
});