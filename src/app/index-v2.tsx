import React, { useState } from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Slider from '@react-native-community/slider';

import { LoaderV2 } from '../../loaders/v2';

export default function IndexV2() {
  const [size, setSize] = useState(180);
  const [speed, setSpeed] = useState(1);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Loader Preview */}
        <View style={styles.loaderContainer}>
          <LoaderV2 size={size} speed={speed} />
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.headerRow}>
            <Text style={styles.headerText}>
              Thinking Orbs Controls
            </Text>

            <Text style={styles.modeText}>
              Vortex — 3s loop
            </Text>
          </View>

          {/* Size */}
          <View style={styles.control}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Orb Size (Diameter)
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

          {/* Speed */}
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
