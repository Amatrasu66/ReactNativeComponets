import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Loaders</Text>
      <Link href="/v1" asChild>
        <Pressable style={styles.card}>
          <Text style={styles.cardTitle}>V1 — GlowingLoader</Text>
          <Text style={styles.cardHint}>Open demo</Text>
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
  },
  card: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  cardHint: {
    fontSize: 13,
    opacity: 0.6,
  },
});
