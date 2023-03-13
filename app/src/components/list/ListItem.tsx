import { FC, ReactNode } from 'react';
import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text, TouchableRipple, TouchableRippleProps } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Box } from '../layout/Box';
import { AddrOrLabelIcon } from '../Identicon/AddrOrLabelIcon';
import { TextProps } from '@theme/types';

/*
 * https://m3.material.io/components/lists/specs
 */

type Lines = 1 | 2 | 3;

interface ListIconElementProps extends IconProps {
  disabled?: boolean;
}

export interface ListItemTextProps {
  Text: FC<TextProps>;
}

export interface ListItemProps extends Pick<TouchableRippleProps, 'onPress' | 'disabled'> {
  leading?: FC<ListIconElementProps> | string;
  overline?: ReactNode | FC<ListItemTextProps>;
  headline: ReactNode | FC<ListItemTextProps>;
  supporting?: ReactNode | FC<ListItemTextProps>;
  trailing?: FC<ListIconElementProps & ListItemTextProps> | ReactNode | number;
  maxTrailing?: number;
  lines?: Lines;
  selected?: boolean;
}

export const ListItem = ({
  leading: Leading,
  overline: Overline,
  headline: Headline,
  supporting: Supporting,
  trailing: Trailing,
  maxTrailing = 100,
  lines = (1 + Number(!!Overline) + Number(!!Supporting)) as Lines,
  selected,
  disabled,
  ...touchableProps
}: ListItemProps) => {
  const styles = useStyles({ lines, selected, disabled });

  if (typeof Trailing === 'number' && Trailing > maxTrailing) Trailing = `${maxTrailing}+`;

  const OverlineText = ({ style, ...props }: TextProps) => (
    <Text variant="labelSmall" numberOfLines={1} {...props} style={[styles.overline, style]} />
  );
  const HeadlineText = ({ style, ...props }: TextProps) => (
    <Text variant="bodyLarge" numberOfLines={2} {...props} style={[styles.headline, style]} />
  );
  const SupportingText = ({ style, ...props }: TextProps) => (
    <Text
      variant="bodyMedium"
      {...props}
      style={[styles.supporting, style]}
      numberOfLines={Math.max(lines - 1, 1)}
    />
  );
  const TrailingText = ({ style, ...props }: TextProps) => (
    <Text variant="labelSmall" {...props} style={[styles.trailingText, style]} />
  );

  return (
    <TouchableRipple {...touchableProps} style={styles.container} disabled={disabled}>
      <>
        {Leading && (
          <Box style={styles.leadingContainer}>
            {typeof Leading === 'string' ? (
              <AddrOrLabelIcon
                label={Leading}
                size={styles.leadingAvatarContainer.fontSize}
                style={styles.leadingAvatarContainer}
                labelStyle={styles.leadingAvatarLabel}
              />
            ) : (
              <Leading
                size={styles.leadingIcon.fontSize}
                color={styles.leadingIcon.backgroundColor}
                disabled={disabled}
              />
            )}
          </Box>
        )}

        <Box style={styles.mainContainer}>
          {Overline &&
            (typeof Overline === 'function' ? (
              <Overline Text={OverlineText} />
            ) : (
              <OverlineText>{Overline}</OverlineText>
            ))}

          {typeof Headline === 'function' ? (
            <Headline Text={HeadlineText} />
          ) : (
            <HeadlineText>{Headline}</HeadlineText>
          )}

          {Supporting &&
            (typeof Supporting === 'function' ? (
              <Supporting Text={SupportingText} />
            ) : (
              <SupportingText>{Supporting}</SupportingText>
            ))}
        </Box>

        {Trailing && (
          <Box style={styles.trailingContainer}>
            {typeof Trailing === 'function' ? (
              <Trailing
                size={styles.trailingIcon.fontSize}
                color={styles.trailingIcon.color}
                disabled={disabled}
                Text={TrailingText}
              />
            ) : (
              <TrailingText>{Trailing}</TrailingText>
            )}
          </Box>
        )}
      </>
    </TouchableRipple>
  );
};

interface StyleProps {
  lines: Lines;
  selected?: boolean;
  disabled?: boolean;
}

export enum ListItemHeight {
  SINGLE_LINE = 56,
  DOUBLE_LINE = 72,
  TRIPLE_LINE = 88,
}

const useStyles = makeStyles(({ colors, s, corner }, { lines, selected, disabled }: StyleProps) => {
  const justifyContent = lines === 3 ? 'flex-start' : 'center';

  return {
    container: {
      flexDirection: 'row',
      // backgroundColor: !disabled ? undefined : colors.surfaceDisabled,
      height: [
        s(ListItemHeight.SINGLE_LINE),
        s(ListItemHeight.DOUBLE_LINE),
        s(ListItemHeight.TRIPLE_LINE),
      ][lines - 1],
      paddingLeft: s(16),
      paddingRight: s(24),
      paddingVertical: lines === 3 ? s(12) : s(8),
    },
    leadingContainer: {
      justifyContent,
      marginRight: s(16),
    },
    leadingAvatarContainer: {
      fontSize: 40,
      backgroundColor: !disabled ? colors.primaryContainer : colors.primaryContainerDisabled,
      borderRadius: corner.full,
    },
    leadingAvatarLabel: {
      color: !disabled ? colors.onPrimaryContainer : colors.onPrimaryContainerDisabled,
    },
    leadingIcon: {
      fontSize: 18,
      backgroundColor: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
    },
    mainContainer: {
      flex: 1,
      justifyContent,
    },
    overline: {
      color: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
    },
    headline: {
      color: !disabled ? colors.onSurface : colors.onSurfaceDisabled,
    },
    supporting: {
      color: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
    },
    trailingContainer: {
      justifyContent,
      alignItems: 'flex-end',
      marginLeft: s(16),
    },
    trailingText: {
      color: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
      textAlign: 'right',
    },
    trailingIcon: {
      fontSize: s(24),
      color: match({ selected, disabled })
        .with({ disabled: true }, () => colors.onSurfaceDisabled)
        .with({ selected: undefined }, () => colors.onSurfaceVariant)
        .with({ selected: true }, () => colors.primary)
        .with({ selected: false }, () => colors.onSurface)
        .exhaustive(),
    },
  };
});
