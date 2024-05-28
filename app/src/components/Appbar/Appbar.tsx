import { IconProps } from '@theme/icons';
import { Arraylike, toArray } from 'lib';
import { FC, ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { AppbarBack } from './AppbarBack';
import { AppbarClose } from './AppbarClose';
import { TextProps } from '@theme/types';
import { P, match } from 'ts-pattern';
import { AppbarMenu } from '#/Appbar/AppbarMenu';
import { createStyles, useStyles } from '@theme/styles';

const LEADING_COMPONENT = {
  back: AppbarBack,
  close: AppbarClose,
  menu: AppbarMenu,
};

export interface AppbarProps extends Pick<StyleOptions, 'center'> {
  mode?: StyleOptions['mode'];
  leading?: FC<IconProps & { style?: StyleProp<ViewStyle> }> | keyof typeof LEADING_COMPONENT;
  trailing?: Arraylike<FC<IconProps>>;
  headline?: ReactNode | FC<Omit<TextProps, 'children'>>;
  elevated?: boolean;
  inset?: boolean;
}

export function Appbar({
  mode = 'small',
  leading = 'back',
  trailing,
  headline: Headline = '',
  center,
  elevated,
  inset = true,
}: AppbarProps) {
  const { styles } = useStyles(stylesheet({ mode, center, inset }));

  const Leading = typeof leading === 'string' ? LEADING_COMPONENT[leading] : leading;

  const HeadlineView = () => (
    <View style={styles.headlineContainer}>
      {typeof Headline === 'function' ? (
        <Headline style={styles.headline} />
      ) : (
        <Text style={styles.headline}>{Headline}</Text>
      )}
    </View>
  );

  return (
    <Surface elevation={elevated ? 2 : 0} style={styles.root}>
      <View style={styles.headerContainer}>
        <Leading
          size={styles.leadingIcon.fontSize}
          color={styles.leadingIcon.color}
          style={styles.leadingContainer}
        />

        <View style={styles.mainHeadlineSection}>{mode === 'small' && <HeadlineView />}</View>

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

      {mode !== 'small' && <HeadlineView />}
    </Surface>
  );
}

interface StyleOptions {
  mode: 'small' | 'medium' | 'large';
  center?: boolean;
  inset?: boolean;
}

const stylesheet = ({ mode, center, inset }: StyleOptions) =>
  createStyles(({ colors, fonts }, runtime) => {
    const insets = inset ? runtime.insets : undefined;

    return {
      root: {
        display: 'flex',
        justifyContent: match(mode)
          .with('small', () => 'center' as const)
          .with(P.union('medium', 'large'), () => 'space-between' as const)
          .exhaustive(),
        height:
          (insets?.top ?? 0) +
          {
            small: 64,
            medium: 112,
            large: 154,
          }[mode],
        paddingTop:
          (insets?.top ?? 0) +
          match(mode)
            .with('small', () => 0)
            .with(P.union('medium', 'large'), () => 20)
            .exhaustive(),
        paddingBottom: {
          small: 0,
          medium: 24,
          large: 28,
        }[mode],
        paddingHorizontal: 16,
      },
      headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      leadingContainer: {
        marginRight: 16,
      },
      leadingIcon: {
        color: colors.onSurface,
        fontSize: 24,
      },
      trailingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginLeft: 16,
      },
      trailingIcon: {
        color: colors.onSurfaceVariant,
        fontSize: 24,
      },
      mainHeadlineSection: {
        flex: 1,
      },
      headlineContainer: {
        ...(center && { flexGrow: 1 }),
        alignItems: center ? 'center' : 'flex-start',
      },
      headline: {
        ...fonts[
          (
            {
              small: 'titleLarge',
              medium: 'headlineSmall',
              large: 'headlineMedium',
            } as const
          )[mode]
        ],
        color: colors.onSurface,
      },
      supporting: {
        color: colors.onSurfaceVariant,
      },
    };
  });
