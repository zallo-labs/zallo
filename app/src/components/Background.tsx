import { View } from 'react-native';
import { ChildrenProps } from '@util/children';
import { useTheme } from '@util/theme/paper';

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
