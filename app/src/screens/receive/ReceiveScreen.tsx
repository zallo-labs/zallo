import { Box } from '@components/Box';
import { Container } from '@components/list/Container';
import { QrCode } from '@features/qr/QrCode';
import { SelectedAccountCard } from '~/components2/account/SelectedAccountCard';
import { useSelectedAccount } from '~/components2/account/useSelectedAccount';
import { ReceiveAppbar } from './ReceiveAppbar';
import { buildAddrLink, buildTransferLink } from '@features/qr/addrLink';
import { useMemo, useState } from 'react';
import { BigNumber } from 'ethers';
import { SelectableTokenAmount } from '~/components2/token/SelectableTokenAmount';
import { useSelectedToken } from '~/components2/token/useSelectedToken';
import { Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { BottomNavigatorProps } from '~/navigation/BottomNavigator';

export const ReceiveScreen = () => {
  const { safe } = useSelectedAccount();
  const token = useSelectedToken();
  const navigation = useNavigation<BottomNavigatorProps['navigation']>();

  const [amount, setAmount] = useState<BigNumber | undefined>();

  const url = useMemo(() => {
    if (!amount) return buildAddrLink({ target_address: safe.safe.address });

    return buildTransferLink(
      { target_address: safe.safe.address },
      token,
      amount,
    );
  }, [amount, safe.safe.address, token]);

  return (
    <Box flex={1}>
      <ReceiveAppbar url={url} />

      <Box flex={1} justifyContent="space-around" mx={4} my={3}>
        <QrCode value={url} />

        <Container separator={<Box my={2} />}>
          {amount && (
            <SelectableTokenAmount amount={amount} onChange={setAmount} />
          )}

          <SelectedAccountCard large balance={false} />

          {!amount && (
            <Button
              icon="plus"
              style={{ alignSelf: 'flex-end' }}
              onPress={() =>
                navigation.navigate('Amount', { onChange: setAmount })
              }
            >
              Amount
            </Button>
          )}
        </Container>
      </Box>
    </Box>
  );
};
