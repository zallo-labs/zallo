import { ListItem } from '#/list/ListItem';
import { TokenAmount } from '#/token/TokenAmount';
import { TokenIcon } from '#/token/TokenIcon';
import { SwapIcon } from '@theme/icons';
import { ICON_SIZE } from '@theme/paper';
import Decimal from 'decimal.js';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { FeesItem_transaction$key } from '~/api/__generated__/FeesItem_transaction.graphql';
import { useSelectToken } from '~/hooks/useSelectToken';

const Transaction = graphql`
  fragment FeesItem_transaction on Transaction {
    id
    account {
      id
      address
    }
    feeToken {
      id
      address
      ...TokenIcon_token
      ...TokenAmount_token
    }
    maxAmount
    estimatedFees {
      id
      networkFee
      paymasterFees {
        total
      }
    }
    systx {
      id
      usdPerFeeToken
    }
  }
`;

const Update = graphql`
  mutation FeesItem_UpdateMutation($transaction: ID!, $feeToken: Address!) {
    updateTransaction(input: { id: $transaction, feeToken: $feeToken }) {
      ...FeesItem_transaction
    }
  }
`;

export interface FeesItemProps {
  transaction: FeesItem_transaction$key;
}

export function FeesItem(props: FeesItemProps) {
  const t = useFragment(Transaction, props.transaction);
  const selectToken = useSelectToken();

  const update = useMutation(Update);

  const estimatedFees = new Decimal(t.estimatedFees.networkFee).plus(
    t.estimatedFees.paymasterFees.total,
  );

  return (
    <ListItem
      variant="surface"
      leading={<TokenIcon token={t.feeToken} size={ICON_SIZE.small} />}
      headline="Fees"
      supporting={
        <>
          {estimatedFees && (
            <>
              <TokenAmount token={t.feeToken} amount={estimatedFees} />
              {' - '}
            </>
          )}
          <TokenAmount token={t.feeToken} amount={t.maxAmount} />
        </>
      }
      trailing={<SwapIcon />}
      onPress={async () => {
        const token = await selectToken({ account: t.account.address, feeToken: true });
        if (token) await update({ transaction: t.id, feeToken: token });
      }}
    />
  );
}
