import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { ReactNode } from 'react';
import { ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { CloseIcon } from '@theme/icons';
import { SIDE_SHEET } from './SideSheetLayout';
import { useAtom } from 'jotai';
import { SideSheetContainer } from './SideSheetContainer';

export interface BareSideSheetProps {
  children: ReactNode;
  headline?: string;
  style?: StyleProp<ViewStyle>;
}

export function BareSideSheet({ children, headline, style }: BareSideSheetProps) {
  const { styles } = useStyles(stylesheet);
  const [visible, show] = useAtom(SIDE_SHEET);

  const close = () => show(false);

  if (!visible) return null;

  return (
    <SideSheetContainer close={close}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={styles.headline}>
          {headline}
        </Text>

        <CloseIcon style={styles.close} onPress={close} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, style]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SideSheetContainer>
  );
}

const stylesheet = createStyleSheet(({ colors }) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  headline: {
    flex: 1,
    color: colors.onSurfaceVariant,
  },
  close: {
    marginLeft: 12,
    color: colors.onSurfaceVariant,
  },
  content: {
    flex: 1,
  },
}));
