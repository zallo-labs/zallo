import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { ChildrenProps } from '@util/children';
import { useTheme } from 'react-native-paper';

export const SafeArea = ({ children }: ChildrenProps) => {
  const { colors } = useTheme();

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: colors.background,
        }}
      >
        {children}
      </SafeAreaView>
    </SafeAreaProvider>
  );
};
