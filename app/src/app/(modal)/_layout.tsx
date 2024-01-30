import { Slot, Stack } from 'expo-router';

export default function SheetLayout() {
  return (
    <>
      <Stack.Screen
        options={{
          presentation: 'transparentModal',
          headerShown: false,
          animation: 'fade',
          animationDuration: 100,
        }}
      />
      <Slot />
    </>
  );
}
