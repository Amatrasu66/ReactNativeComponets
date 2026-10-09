import { StyleSheet, View } from 'react-native';

import { GlowingLoader } from '../../loaders/v1';
import { LoaderV2 } from '../../loaders/v2/ThinkingOrbsLoader';

export default function V1Screen() {
  return (
    <View style={styles.container}>
      <GlowingLoader />
      <LoaderV2 />
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
