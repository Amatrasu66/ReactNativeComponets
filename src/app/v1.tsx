import { StyleSheet, View } from 'react-native';

import { GlowingLoader } from '../../loaders/v1';

export default function V1Screen() {
  return (
    <View style={styles.container}>
      <GlowingLoader />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
