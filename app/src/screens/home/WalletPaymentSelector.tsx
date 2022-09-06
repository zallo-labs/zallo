import { PayIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useState } from 'react';
import { Pressable } from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
  WalletSelector,
  WalletSelectorProps,
} from '~/components/wallet/WalletSelector/WalletSelector';
import * as Haptics from 'expo-haptics';
import { Box } from '~/components/layout/Box';
import { Text } from 'react-native-paper';

export interface WalletPaymentSelectorProps extends WalletSelectorProps {}

export const WalletPaymentSelector = (
  selectorProps: WalletPaymentSelectorProps,
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

      <WalletSelector
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
    marginTop: space(2),
  },
}));
