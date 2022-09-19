import { PayIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { Pressable } from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
  AccountSelector,
  AccountSelectorProps,
} from '~/components/account/AccountSelector/AccountSelector';
import * as Haptics from 'expo-haptics';
import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';

export interface AccountPaymentSelectorProps extends AccountSelectorProps {}

export const AccountPaymentSelector = (
  selectorProps: AccountPaymentSelectorProps,
) => {
  const styles = useStyles();

  const [active, setActive] = useState(false);

  return (
    <Pressable onPress={() => setActive(false)}>
      <Collapsible collapsed={!active}>
        <Box vertical alignItems="center" mt={2} mb={4}>
          <PayIcon style={styles.payIcon} />
          <Text style={styles.payCaption}>Hold to reader</Text>
        </Box>
      </Collapsible>

      <AccountSelector
        {...selectorProps}
        cardProps={{
          ...selectorProps.cardProps,
          onPress: (event) => {
            setActive((active) => {
              if (!active)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              return !active;
            });
            selectorProps.cardProps?.onPress?.(event);
          },
        }}
      />
    </Pressable>
  );
};

const useStyles = makeStyles(({ colors, space }) => ({
  payIcon: {
    fontSize: 48,
    color: colors.primary,
  },
  payCaption: {
    color: colors.primary,
    marginTop: space(1),
  },
}));
