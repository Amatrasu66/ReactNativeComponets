import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Components' }} />
      <Stack.Screen name="v1" options={{ title: 'V1 Loader' }} />
      <Stack.Screen name="v2" options={{ title: 'V2 Loader' }} />
    </Stack>
  );
}