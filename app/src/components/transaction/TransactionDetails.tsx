import { ItemList } from '#/layout/ItemList';
import { ItemListSubheader } from '#/list/ItemListSubheader';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TransactionDetails_transaction$key } from '~/api/__generated__/TransactionDetails_transaction.graphql';
import { FeesItem } from './FeesItem';
import { ListItem } from '#/list/ListItem';
import { GasOutlineIcon } from '@theme/icons';
import { FormattedNumber } from '#/format/FormattedNumber';
import { Percent } from '#/format/Percent';

const Transaction = graphql`
  fragment TransactionDetails_transaction on Transaction {
    gasLimit
    result {
      gasUsed
    }
    ...FeesItem_transaction
    ...GasItems_transaction
  }
`;

export interface TransactionDetailsProps {
  transaction: TransactionDetails_transaction$key;
}

export function TransactionDetails(props: TransactionDetailsProps) {
  const t = useFragment(Transaction, props.transaction);

  return (
    <>
      <ItemListSubheader>Details</ItemListSubheader>

      <ItemList>
        <FeesItem transaction={t} />

        {t.result ? (
          <ListItem
            variant="surface"
            leading={GasOutlineIcon}
            overline="Gas usage"
            headline={
              <>
                <FormattedNumber value={t.result.gasUsed} />
                {' / '}
                <FormattedNumber value={t.gasLimit} />
              </>
            }
            trailing={
              <Percent
                value={Number((BigInt(t.result.gasUsed) * 10000n) / BigInt(t.gasLimit)) / 100}
              />
            }
          />
        ) : (
          <ListItem
            variant="surface"
            leading={GasOutlineIcon}
            overline="Gas limit"
            headline={<FormattedNumber value={t.gasLimit} />}
          />
        )}
      </ItemList>
    </>
  );
}
