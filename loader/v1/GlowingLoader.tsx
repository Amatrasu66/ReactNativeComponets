import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

export type GlowingLoaderProps = {
  label?: string;
};

/**
 * Minimal V1 placeholder.
 * The real glowing loader implementation will be added later.
 */
export function GlowingLoader({ label = 'Loading…' }: GlowingLoaderProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
    opacity: 0.7,
  },
});
