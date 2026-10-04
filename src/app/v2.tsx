import { StyleSheet, View } from 'react-native';
import { LoaderV2 } from '../../loaders/v2';

export default function V2PreviewScreen() {
  return (
    <View style={styles.screen}>
      <LoaderV2 />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050505', // near-black stage, like the reference preview
    alignItems: 'center',
    justifyContent: 'center',
  },
});