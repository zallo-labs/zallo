import { Actions } from '@components/Actions';
import { useFormattedAddr } from '@components/Addr';
import { AppbarBack } from '@components/AppbarBack';
import { Box } from '@components/Box';
import {
  usePropose,
  withProposeProvider,
} from '@features/execute/ProposeProvider';
import { HomeScreenProps } from '@features/home/HomeScreen';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { useLastToken } from '@features/select-token/useLastToken';
import { useNavigation } from '@react-navigation/native';
import { BigNumber } from 'ethers';
import { Address } from 'lib';
import { useCallback, useState } from 'react';
import { Appbar, FAB } from 'react-native-paper';
import { createTransferTx, Token } from '~/token/token';
import { SendInput } from './SendInput';
import { SendTokenChip } from './SendTokenChip';

export interface SendScreenParams {
  to: Address;
  token?: Token;
}

export const useNavigateToSend = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return useCallback(
    () =>
      // Contacts {to} -> Send(to)
      navigation.navigate('Contacts', {
        target: {
          output: 'to',

          route: 'Send',
        },
      }),
    [navigation],
  );
};

export type SendScreenProps = RootNavigatorScreenProps<'Send'>;

export const SendScreen = withProposeProvider(
  ({ navigation, route }: SendScreenProps) => {
    const { to } = route.params;
    const propose = usePropose();
    const formattedTo = useFormattedAddr({ addr: to });
    const lastToken = useLastToken();
    const token = route.params.token ?? lastToken;

    const [amount, setAmount] = useState<BigNumber | undefined>();

    return (
      <Box flex={1}>
        {/* TODO: MD3 - mode="medium" */}
        <Appbar.Header>
          <AppbarBack />

          <Appbar.Content title={`To ${formattedTo}`} />

          <Appbar.Action icon="close" onPress={navigation.popToTop} />
        </Appbar.Header>

        <Box horizontal justifyContent="center" mt={100} mb={50}>
          <SendTokenChip token={token} />
        </Box>

        <SendInput token={token} value={amount} onChange={setAmount} />

        <Actions>
          <FAB
            icon="send"
            label="Send"
            disabled={amount === undefined}
            onPress={
              amount !== undefined
                ? () => propose(createTransferTx(token, to, amount))
                : undefined
            }
          />
        </Actions>
      </Box>
    );
  },
);
