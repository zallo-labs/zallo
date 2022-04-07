import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ChildrenProps } from '@util/provider';

export const SafeArea = ({ children }: ChildrenProps) => (
  <SafeAreaProvider>
    <SafeAreaView
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {children}
    </SafeAreaView>
  </SafeAreaProvider>
);
