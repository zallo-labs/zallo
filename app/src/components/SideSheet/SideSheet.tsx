import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ReactNode, useEffect } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SideSheetSurface, useSideSheetType } from './SideSheetSurface';
import { Text } from 'react-native-paper';
import { CloseIcon } from '@theme/icons';
import { usePrevious } from '~/hooks/usePrevious';

export interface SideSheetProps {
  children: ReactNode;
  headline?: string;
  visible: boolean;
  close: () => void;
  style?: StyleProp<ViewStyle>;
}

export function SideSheet({ children, headline, visible, close, style }: SideSheetProps) {
  const type = useSideSheetType();
  const { styles } = useStyles(stylesheet, { type });

  const shouldClose = usePrevious(type) === 'standard' && type === 'modal';
  useEffect(() => {
    if (shouldClose) close();
  }, [close, shouldClose]);

  if (!visible || shouldClose) return null;

  return (
    <SideSheetSurface close={close}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headline}>
          {headline}
        </Text>

        <CloseIcon style={styles.close} onPress={close} />
      </View>

      <ScrollView contentContainerStyle={style} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SideSheetSurface>
  );
}

const stylesheet = createStyleSheet(({ colors }) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
    variants: {
      type: {
        standard: {
          marginHorizontal: 24,
        },
        modal: {
          marginLeft: 16,
          marginRight: 24,
        },
      },
    },
  },
  headline: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  close: {
    marginLeft: 12,
    color: colors.onSurfaceVariant,
  },
}));
