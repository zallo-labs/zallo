import { hexlify } from 'ethers/lib/utils';
import {
  Account,
  Call,
  getWalletId,
  hashQuorum,
  OnlyRequiredItems,
  toWalletRef,
} from 'lib';
import { memo } from 'react';
import { Text } from 'react-native-paper';
import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { Container } from '~/components/layout/Container';
import { Suspend } from '~/components/Suspender';
import {
  ACCOUNT_INTERFACE,
  UPSERT_ACCOUNT_FUNCTION,
} from '~/queries/useContractMethod.api';
import { useWallet } from '~/queries/wallets/useWallet';
import { AddedOrRemovedQuorumRow } from './AddedQuorumRow';

type UpsertWalletParams = OnlyRequiredItems<
  Parameters<Account['upsertWallet']>
>;

const decodeUpsertWalletRef = (call: Call) => {
  const [ref] = ACCOUNT_INTERFACE.decodeFunctionData(
    UPSERT_ACCOUNT_FUNCTION,
    call.data,
  ) as UpsertWalletParams;

  return toWalletRef(hexlify(ref));
};

export interface UpsertWalletMethodProps {
  call: Call;
}

export const UpsertWalletMethod = memo(({ call }: UpsertWalletMethodProps) => {
  const ref = decodeUpsertWalletRef(call);
  const wallet = useWallet({
    accountAddr: call.to,
    ref,
    id: getWalletId(call.to, ref),
  });

  if (!wallet) return <Suspend />;

  const modifiedQuorums = wallet.quorums.filter(
    (q) => q.state.status !== 'active',
  );

  return (
    <Accordion
      title={
        <Text variant="titleMedium">{`${
          wallet.state.status === 'add' ? 'Create' : 'Modify'
        } wallet: ${wallet.name}`}</Text>
      }
    >
      <Container mx={3} separator={<Box mb={1} />}>
        <Text variant="titleSmall">Quorums</Text>

        {modifiedQuorums.map((q) => (
          <AddedOrRemovedQuorumRow key={hashQuorum(q.approvers)} quorum={q} />
        ))}
      </Container>
    </Accordion>
  );
});
