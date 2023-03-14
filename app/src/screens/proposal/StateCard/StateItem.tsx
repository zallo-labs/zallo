import { IconProps } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { DateTime } from 'luxon';
import { FC, Fragment } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import Animated, { FadeIn, FadeInDown, FadeOut, FadeOutUp } from 'react-native-reanimated';
import { Addr } from '~/components/addr/Addr';
import { CARD_BORDER_RADIUS } from '~/components/card/Card';
import { Timestamp } from '~/components/format/Timestamp';
import { Box } from '~/components/layout/Box';

interface StateItemProps {
  Icon: FC<IconProps>;
  title: string;
  timestamp?: DateTime;
  events?: {
    approver: Address;
    timestamp?: DateTime;
  }[];
  selected?: boolean | 'error';
  style?: StyleProp<ViewStyle>;
}

export const StateItem = ({ Icon, title, timestamp, events, selected, style }: StateItemProps) => {
  const styles = useStyles(selected);

  return (
    <Animated.View style={[styles.container, style]} entering={FadeInDown} exiting={FadeOutUp}>
      <Box horizontal>
        <Box style={styles.iconContainer}>
          <Icon color={styles.icon.color} size={styles.icon.fontSize} />
        </Box>

        <Text variant="labelLarge" style={styles.title}>
          {title}
        </Text>

        {timestamp && (
          <Text variant="bodyMedium">
            <Timestamp timestamp={timestamp} />
          </Text>
        )}
      </Box>

      <Box vertical>
        {events?.map((event) => (
          <Box key={event.approver} horizontal>
            <Box style={styles.iconContainer} />

            <Text variant="bodyMedium" style={styles.addr}>
              <Addr addr={event.approver} />
            </Text>

            {event.timestamp && (
              <Text variant="bodyMedium" style={styles.timestamp}>
                <Timestamp timestamp={event.timestamp} />
              </Text>
            )}
          </Box>
        ))}
      </Box>
    </Animated.View>
  );
};

const useStyles = makeStyles(
  ({ colors, space, iconSize, onBackground }, selected?: boolean | string) => {
    const backgroundColor = selected
      ? selected === true
        ? colors.primaryContainer
        : colors.errorContainer
      : undefined;
    const color = onBackground(backgroundColor);

    return {
      container: {
        backgroundColor,
        padding: space(2),
        borderRadius: CARD_BORDER_RADIUS,
      },
      icon: {
        fontSize: iconSize.small,
        color,
      },
      iconContainer: {
        width: iconSize.small,
        marginRight: space(2),
      },
      title: {
        flex: 1,
        color,
      },
      addr: {
        flex: 1,
        color,
      },
      timestamp: {
        color,
      },
    };
  },
);
