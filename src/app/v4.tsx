/**
 * src/app/v4.tsx
 * Minimal preview screen for Loader V4 — CometOrbitLoader.
 * Route: /v4
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';

import { LoaderV4 } from '../../loaders/v4';

export default function V4Preview() {
  return (
    <View style={styles.screen}>
      <LoaderV4 />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
});