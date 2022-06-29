import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { ChildrenProps } from '@util/children';

export const Background = ({ children }: ChildrenProps) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: colors.background,
      }}
    >
      {children}
    </View>
  );
};
