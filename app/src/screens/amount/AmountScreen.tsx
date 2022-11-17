import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { CheckIcon, CloseIcon } from '~/util/theme/icons';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useState } from 'react';
import { Appbar } from 'react-native-paper';
import { FAB } from '~/components/FAB';
import { useSelectedToken, useSelectToken } from '~/components/token/useSelectedToken';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { AmountInput } from './AmountInput';
import { TokenCard } from '~/components/token/TokenCard';

export interface AmountScreenParams {
  onChange: (amount?: BigNumber) => void;
}

export type AmountScreenProps = RootNavigatorScreenProps<'Amount'>;

export const AmountScreen = ({ navigation, route }: AmountScreenProps) => {
  const { onChange } = route.params;
  const [token, selectToken] = [useSelectedToken(), useSelectToken()];

  const [amount, setAmount] = useState<BigNumber | undefined>();

  return (
    <Box flex={1}>
      <Appbar.Header>
        <AppbarBack />
        <Appbar.Content title="Amount" />
        <Appbar.Action
          icon={CloseIcon}
          onPress={() => {
            onChange(undefined);
            navigation.goBack();
          }}
        />
      </Appbar.Header>

      <Box mx={3}>
        <Box mt={5} mb={6}>
          <TokenCard
            token={token}
            onPress={() => {
              navigation.navigate('Tokens', {
                onSelect: (token) => {
                  selectToken(token);
                  navigation.goBack();
                },
              });
            }}
          />
        </Box>

        <AmountInput token={token} amount={amount} setAmount={setAmount} />
      </Box>

      <FAB
        icon={CheckIcon}
        label="Accept"
        disabled={!amount || amount.eq(ZERO)}
        onPress={() => {
          onChange(amount);
          navigation.goBack();
        }}
      />
    </Box>
  );
};
