import { FC, ReactNode } from 'react';
import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Text, TouchableRipple, TouchableRippleProps } from 'react-native-paper';
import { Box } from '../layout/Box';
import { AddressOrLabelIcon } from '../Identicon/AddressOrLabelIcon';
import { TextProps } from '@theme/types';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { O } from 'ts-toolbelt';

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

export type ListItemProps = Pick<TouchableRippleProps, 'onPress'> &
  O.Optional<StyleProps, 'lines'> & {
    leading?: FC<ListIconElementProps> | string;
    overline?: ReactNode | FC<ListItemTextProps>;
    headline: ReactNode | FC<ListItemTextProps>;
    supporting?: ReactNode | FC<ListItemTextProps>;
    trailing?: FC<ListIconElementProps & ListItemTextProps> | ReactNode | number;
    containerStyle?: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
  };

export const ListItem = ({
  leading: Leading,
  overline: Overline,
  headline: Headline,
  supporting: Supporting,
  trailing: Trailing,
  lines = (1 + Number(!!Overline) + Number(!!Supporting)) as Lines,
  selected,
  disabled,
  containerStyle,
  textStyle,
  ...touchableProps
}: ListItemProps) => {
  const styles = useStyles({ lines, selected, disabled });

  const OverlineText = ({ style, ...props }: TextProps) => (
    <Text
      variant="labelSmall"
      numberOfLines={1}
      {...props}
      style={[styles.overline, textStyle, style]}
    />
  );
  const HeadlineText = ({ style, ...props }: TextProps) => (
    <Text
      variant="bodyLarge"
      numberOfLines={2}
      {...props}
      style={[styles.headline, textStyle, style]}
    />
  );
  const SupportingText = ({ style, ...props }: TextProps) => (
    <Text
      variant="bodyMedium"
      {...props}
      style={[styles.supporting, textStyle, style]}
      numberOfLines={Math.max(lines - 1, 1)}
    />
  );
  const TrailingText = ({ style, ...props }: TextProps) => (
    <Text variant="labelSmall" {...props} style={[styles.trailingText, textStyle, style]} />
  );

  return (
    <TouchableRipple
      {...touchableProps}
      style={[styles.container, containerStyle]}
      disabled={disabled}
    >
      <>
        {Leading && (
          <Box style={styles.leadingContainer}>
            {typeof Leading === 'string' ? (
              <AddressOrLabelIcon
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

const useStyles = makeStyles(
  ({ colors, corner, stateLayer, iconSize }, { lines, selected, disabled }: StyleProps) => {
    const justifyContent = lines === 3 ? 'flex-start' : 'center';

    const withState = (color: string) => stateLayer(color, disabled && 'disabled');

    return {
      container: {
        flexDirection: 'row',
        ...(selected && { backgroundColor: stateLayer(colors.onSurface, 'focus') }),
        height: [
          ListItemHeight.SINGLE_LINE,
          ListItemHeight.DOUBLE_LINE,
          ListItemHeight.TRIPLE_LINE,
        ][lines - 1],
        paddingLeft: 16,
        paddingRight: 24,
        paddingVertical: lines === 3 ? 12 : 8,
      },
      leadingContainer: {
        justifyContent,
        marginRight: 16,
      },
      leadingAvatarContainer: {
        fontSize: iconSize.medium,
        backgroundColor: withState(colors.tertiaryContainer),
        borderRadius: corner.full,
      },
      leadingAvatarLabel: {
        color: withState(colors.tertiary),
      },
      leadingIcon: {
        fontSize: 18,
        backgroundColor: withState(colors.onSurfaceVariant),
      },
      mainContainer: {
        flex: 1,
        justifyContent,
      },
      overline: {
        color: withState(colors.onSurfaceVariant),
      },
      headline: {
        color: withState(colors.onSurface),
      },
      supporting: {
        color: withState(colors.onSurfaceVariant),
      },
      trailingContainer: {
        justifyContent,
        alignItems: 'flex-end',
        marginLeft: 16,
      },
      trailingText: {
        color: withState(colors.onSurfaceVariant),
        textAlign: 'right',
      },
      trailingIcon: {
        fontSize: 24,
        color: withState(colors.onSurface),
      },
    };
  },
);
