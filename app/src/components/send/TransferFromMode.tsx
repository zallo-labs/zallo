import { asAddress, asChain, asFp, asUAddress, isUAddress, UAddress } from 'lib';
import { Actions } from '#/layout/Actions';
import { Button } from '#/Button';
import { useProposeTransaction } from '~/hooks/mutations/useProposeTransaction';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { encodeFunctionData } from 'viem';
import { ERC20 } from 'lib/dapps';
import Decimal from 'decimal.js';
import { CheckAllIcon, ContactsIcon } from '@theme/icons';
import { useRouter } from 'expo-router';
import { TransferFromMode_account$key } from '~/api/__generated__/TransferFromMode_account.graphql';
import { TransferFromMode_token$key } from '~/api/__generated__/TransferFromMode_token.graphql';
import { useState } from 'react';
import { ItemList } from '#/layout/ItemList';
import { ListItem } from '#/list/ListItem';
import { AddressIcon } from '#/Identicon/AddressIcon';
import { createStyles, useStyles } from '@theme/styles';
import { SelectableAddress } from '#/address/SelectableAddress';
import { useSelectAddress } from '~/hooks/useSelectAddress';

const Account = graphql`
  fragment TransferFromMode_account on Account {
    address
    ...useProposeTransaction_account
  }
`;

const Token = graphql`
  fragment TransferFromMode_token on Token {
    address
    decimals
  }
`;

export interface TransferFromModeProps {
  account: TransferFromMode_account$key;
  token: TransferFromMode_token$key;
  to: UAddress | undefined;
  amount: Decimal;
}

export function TransferFromMode({ to, amount, ...props }: TransferFromModeProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const token = useFragment(Token, props.token);
  const propose = useProposeTransaction();
  const router = useRouter();
  const select = useSelectAddress();

  const [from, setFrom] = useState<UAddress | undefined>(undefined);

  const proposeTransfer =
    from &&
    to &&
    (async () => {
      const transaction = await propose(account, {
        operations: [
          {
            to: asAddress(token.address),
            data: encodeFunctionData({
              abi: ERC20,
              functionName: 'transferFrom',
              args: [
                asAddress(from),
                asAddress(to),
                asFp(amount, token.decimals, Decimal.ROUND_DOWN),
              ],
            }),
          },
        ],
        // executionGas: TODO: estimate execution gas
      });
      router.push({ pathname: `/(nav)/transaction/[id]`, params: { id: transaction } });
    });

  return (
    <>
      <ItemList>
        <ListItem
          leading={from ? <AddressIcon address={from} /> : ContactsIcon}
          overline="From"
          headline={from ? <SelectableAddress address={from} /> : 'Send from'}
          containerStyle={styles.item}
          onPress={async () => {
            const address = await select({
              headline: 'Send from',
              include: ['accounts', 'contacts'],
              disabled: [account.address],
              chain: asChain(account.address),
            });
            if (address)
              setFrom(
                isUAddress(address) ? address : asUAddress(address, asChain(account.address)),
              );
          }}
        />
      </ItemList>

      <Actions horizontal>
        <Button
          mode="contained"
          icon={CheckAllIcon}
          onPress={proposeTransfer}
          disabled={!proposeTransfer || amount.lte(0)}
        >
          Review transfer
        </Button>
      </Actions>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));
