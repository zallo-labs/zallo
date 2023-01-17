import { FC, ReactNode } from 'react';
import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text, TouchableRipple, TouchableRippleProps } from 'react-native-paper';
import { match } from 'ts-pattern';
import { Box } from '../layout/Box';
import { AddrOrLabelIcon } from '../Identicon/AddrOrLabelIcon';

/*
 * https://m3.material.io/components/lists/specs
 */

type Lines = 1 | 2 | 3;

interface ListIconElementProps extends IconProps {
  disabled?: boolean;
}

export interface ListItemTextProps {
  Text: FC<{ children: ReactNode }>;
}

export interface ListItemProps extends Pick<TouchableRippleProps, 'onPress' | 'disabled'> {
  leading?: FC<ListIconElementProps> | string;
  headline: ReactNode | FC<ListItemTextProps>;
  supporting?: ReactNode | FC<ListItemTextProps>;
  trailing?: FC<ListIconElementProps & ListItemTextProps> | ReactNode | number;
  maxTrailing?: number;
  lines?: Lines;
  selected?: boolean;
}

export const ListItem = ({
  leading: Leading,
  headline: Headline,
  supporting: Supporting,
  trailing: Trailing,
  maxTrailing = 100,
  lines = Supporting ? 2 : 1,
  selected,
  disabled,
  ...touchableProps
}: ListItemProps) => {
  const styles = useStyles({ lines, selected, disabled });

  if (typeof Trailing === 'number' && Trailing > maxTrailing) Trailing = `${maxTrailing}+`;

  const HeadlineText = ({ children }: { children: ReactNode }) => (
    <Text variant="bodyLarge" style={styles.headline}>
      {children}
    </Text>
  );
  const SupportingText = ({ children }: { children: ReactNode }) => (
    <Text variant="bodyMedium" style={styles.supporting} numberOfLines={lines}>
      {children}
    </Text>
  );
  const TrailingText = ({ children }: { children: ReactNode }) => (
    <Text variant="labelSmall" style={styles.trailingText}>
      {children}
    </Text>
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

const useStyles = makeStyles(({ colors, s, corner }, { lines, selected, disabled }: StyleProps) => {
  const justifyContent = lines === 3 ? 'flex-start' : 'center';

  return {
    container: {
      flexDirection: 'row',
      // backgroundColor: !disabled ? undefined : colors.surfaceDisabled,
      height: [s(56), s(72), s(88)][lines - 1],
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
      backgroundColor: colors.primaryContainer,
      borderRadius: corner.full,
    },
    leadingAvatarLabel: {
      color: colors.onPrimaryContainer,
    },
    leadingIcon: {
      fontSize: 18,
      backgroundColor: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
    },
    mainContainer: {
      flex: 1,
      justifyContent,
    },
    headline: {
      color: !disabled ? colors.onSurface : colors.onSurfaceDisabled,
    },
    supporting: {
      color: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
    },
    trailingContainer: {
      justifyContent,
      marginLeft: s(16),
    },
    trailingText: {
      color: !disabled ? colors.onSurfaceVariant : colors.onSurfaceDisabled,
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
