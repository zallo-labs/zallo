import { ZalloLogo } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { ImageStyle, StyleProp } from 'react-native';

export interface DrawerLogoProps {
  style?: StyleProp<ImageStyle>;
}

export function DrawerLogo({ style }: DrawerLogoProps) {
  return <ZalloLogo style={[styles.logo, style]} contentFit="contain" />;
}

const styles = createStyles({
  logo: {
    minWidth: 146,
    minHeight: 56,
    marginHorizontal: 16,
    alignSelf: 'flex-start',
  },
});
