import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SideSheetSurface, useSideSheetType } from './SideSheetSurface';
import { Text } from 'react-native-paper';
import { CloseIcon } from '@theme/icons';
import { SIDE_SHEET } from './SideSheetLayout';
import { useAtom } from 'jotai';

export interface SideSheetProps {
  children: ReactNode;
  headline?: string;
  style?: StyleProp<ViewStyle>;
}

export function SideSheet({ children, headline, style }: SideSheetProps) {
  const type = useSideSheetType();
  const { styles } = useStyles(stylesheet, { type });
  const [visible, show] = useAtom(SIDE_SHEET);

  const close = () => show(false);

  if (!visible) return null;

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
