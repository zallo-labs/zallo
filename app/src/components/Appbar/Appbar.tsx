import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Arraylike, toArray } from 'lib';
import { FC, ReactNode } from 'react';
import { View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { EdgeInsets, useSafeAreaInsets } from 'react-native-safe-area-context';
import { match } from 'ts-pattern';
import { AppbarBack2 } from './AppbarBack';
import { AppbarClose } from './AppbarClose';

export interface AppbarProps extends Pick<StyleOptions, 'mode' | 'center'> {
  leading: FC<IconProps> | 'back' | 'close';
  trailing?: Arraylike<FC<IconProps>>;
  headline: ReactNode;
  supporting?: ReactNode;
  elevated?: boolean;
  inset?: boolean;
}

export const Appbar = ({
  mode,
  leading,
  trailing,
  headline: Headline,
  supporting: Supporting,
  center,
  elevated,
  inset = true,
}: AppbarProps) => {
  const insets = useSafeAreaInsets();
  const styles = useStyles({ mode, center, insets: inset ? insets : undefined });

  const Leading = leading === 'back' ? AppbarBack2 : leading === 'close' ? AppbarClose : leading;

  return (
    <Surface elevation={elevated ? 2 : 0} style={styles.root}>
      <View style={styles.headerContainer}>
        <Leading size={styles.leadingIcon.fontSize} color={styles.leadingIcon.color} />

        <View style={styles.trailingContainer}>
          {toArray(trailing ?? []).map((Trailing, index) => (
            <Trailing
              key={index}
              size={styles.trailingIcon.fontSize}
              color={styles.trailingIcon.color}
            />
          ))}
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.headline}>{Headline}</Text>

        {Supporting && (
          <Text variant="bodyMedium" style={styles.supporting}>
            {Supporting}
          </Text>
        )}
      </View>
    </Surface>
  );
};

interface StyleOptions {
  mode: 'medium' | 'large';
  center?: boolean;
  insets?: EdgeInsets;
}

const useStyles = makeStyles(({ colors, fonts }, { mode, center, insets }: StyleOptions) => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    height:
      (insets?.top ?? 0) +
      match(mode)
        .with('medium', () => 112)
        .with('large', () => 154)
        .exhaustive(),
    paddingTop: 20 + (insets?.top ?? 0),
    paddingBottom: match(mode)
      .with('medium', () => 24)
      .with('large', () => 28)
      .exhaustive(),
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leadingIcon: {
    color: colors.onSurface,
    fontSize: 24,
  },
  trailingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  trailingIcon: {
    color: colors.onSurfaceVariant,
    fontSize: 24,
  },
  textContainer: {
    alignItems: center ? 'center' : 'flex-start',
  },
  headline: {
    ...fonts[
      match(mode)
        .with('medium', () => 'headlineSmall' as const)
        .with('large', () => 'headlineMedium' as const)
        .exhaustive()
    ],
    color: colors.onSurface,
  },
  supporting: {
    color: colors.onSurfaceVariant,
  },
}));
