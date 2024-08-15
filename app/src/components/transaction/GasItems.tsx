import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { GasItems_transaction$key } from '~/api/__generated__/GasItems_transaction.graphql';

const Transaction = graphql`
  fragment GasItems_transaction on Transaction {
    gasLimit
    result {
      gasUsed
    }
  }
`;

export interface GasItemsProps {
  transaction: GasItems_transaction$key;
}

export function GasItems(props: GasItemsProps) {
  const t = useFragment(Transaction, props.transaction);
  const result = t.result;

  if (!result) return null;

  return null;
}
