import React, { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Slider from '@react-native-community/slider';

import { GlowingLoader } from '../../v1/GlowingLoader';

export default function Index() {
  const [duration, setDuration] = useState(5000);
  const [speed, setSpeed] = useState(0.6);
  const [range, setRange] = useState(2.5);
  const [phase, setPhase] = useState(1.6);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Loader Preview */}
        <View style={styles.loaderContainer}>
          <GlowingLoader
            size={290}
            duration={duration}
            speed={speed}
            range={range}
            phaseOffset={phase}
          />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>
              Loader Animation Controls
            </Text>

            <Text style={styles.modeText}>
              Single Loop Mode
            </Text>
          </View>

          {/* Duration */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Rotation Speed (Duration)
              </Text>

              <Text style={styles.value}>
                {(duration / 1000).toFixed(1)}s
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={1000}
              maximumValue={8000}
              step={250}
              value={duration}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setDuration}
            />
          </View>

          {/* Wave Frequency */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Wave Ripple Frequency
              </Text>

              <Text style={styles.value}>
                {speed.toFixed(2)}x
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.2}
              maximumValue={2.5}
              step={0.05}
              value={speed}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setSpeed}
            />
          </View>

          {/* Flowiness */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Flowiness Spread (Arc Length)
              </Text>

              <Text style={styles.value}>
                {range.toFixed(2)}
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0.1}
              maximumValue={2.5}
              step={0.05}
              value={range}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setRange}
            />
          </View>

          {/* Phase */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Wave Offset Phase
              </Text>

              <Text style={styles.value}>
                {phase.toFixed(2)} rad
              </Text>
            </View>

            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={Math.PI}
              step={0.05}
              value={phase}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#27272A"
              thumbTintColor="#FFFFFF"
              onValueChange={setPhase}
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
    backgroundColor: '#000000',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 32,
    paddingBottom: 40,
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
});