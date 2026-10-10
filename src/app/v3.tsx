/**
 * Minimal standalone preview for Loader V3.
 *
 * Exists only for structural parity with v1.tsx and v2.tsx.
 * The full showcase with controls lives in `index-v3.tsx`.
 *
 * Open route: /v3
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LoaderV3 } from '../../loaders/v3';

export default function V3PreviewScreen() {
  return (
    <View style={styles.screen}>
      <LoaderV3 size={120} speed={1} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
