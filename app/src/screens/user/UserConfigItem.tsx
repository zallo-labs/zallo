import { ChevronRight } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useTotalAvailableValue } from '@token/useTotalAvailableValue';
import { UserConfig } from 'lib';
import { StyleProp, ViewStyle } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';
import { FiatValue } from '~/components/fiat/FiatValue';
import { Box } from '~/components/layout/Box';
import { CombinedUser } from '~/queries/user/useUser.api';

export interface UserConfigItemProps {
  user: CombinedUser;
  config: UserConfig;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const UserConfigItem = ({
  user,
  config,
  onPress,
  style,
}: UserConfigItemProps) => {
  const styles = useStyles();

  const label = config.approvers.join(', ') || 'Without approval';

  return (
    <TouchableRipple onPress={onPress} style={style}>
      <Box>
        <Box
          horizontal
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Text variant="bodyLarge" numberOfLines={2}>
            {label}
          </Text>

          <ChevronRight style={styles.icon} />
        </Box>

        <Box horizontal justifyContent="space-between">
          <Text variant="bodyMedium">Available</Text>
          <Text variant="labelLarge">
            <FiatValue value={useTotalAvailableValue(user, config)} />
          </Text>
        </Box>
      </Box>
    </TouchableRipple>
  );
};

const useStyles = makeStyles(({ colors, iconButton }) => ({
  icon: {
    color: colors.onBackground,
    fontSize: iconButton.size,
  },
}));
