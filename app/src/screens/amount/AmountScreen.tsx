import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { Box } from '~/components/layout/Box';
import { CheckIcon, CloseIcon } from '~/util/theme/icons';
import { BigNumber } from 'ethers';
import { ZERO } from 'lib';
import { useState } from 'react';
import { Appbar } from 'react-native-paper';
import { Fab } from '~/components/Fab/Fab';
import {
  useSelectedToken,
  useSelectToken as useSetSelectedToken,
} from '~/components/token/useSelectedToken';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { AmountInput } from './AmountInput';
import { TokenCard } from '~/components/token/TokenCard';
import { useSelectToken } from '../tokens/useSelectToken';

export interface AmountScreenParams {
  onChange: (amount?: BigNumber) => void;
}

export type AmountScreenProps = StackNavigatorScreenProps<'Amount'>;

export const AmountScreen = ({ navigation, route }: AmountScreenProps) => {
  const { onChange } = route.params;
  const selectToken = useSelectToken();
  const [token, setToken] = [useSelectedToken(), useSetSelectedToken()];

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
            onPress={async () => {
              setToken(await selectToken());
              navigation.goBack();
            }}
          />
        </Box>

        <AmountInput token={token} amount={amount} setAmount={setAmount} />
      </Box>

      <Fab
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
