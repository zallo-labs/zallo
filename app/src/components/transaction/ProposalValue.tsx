import { FragmentType, gql, useFragment } from '@api/generated';
import { FiatValue } from '../FiatValue';
import Decimal from 'decimal.js';

const Transaction = gql(/* GraphQL */ `
  fragment ProposalValue_Transaction on Transaction {
    id
    result {
      id
      transfers {
        id
        value
        isFeeTransfer
      }
    }
    simulation {
      id
      transfers {
        id
        value
        isFeeTransfer
      }
    }
  }
`);

export interface ProposalValueProps {
  proposal: FragmentType<typeof Transaction>;
  hideZero?: boolean;
}

export function ProposalValue(props: ProposalValueProps) {
  const p = useFragment(Transaction, props.proposal);

  const transfers = [...(p.result?.transfers ?? p.simulation?.transfers ?? [])].filter(
    (t) => !t.isFeeTransfer,
  );

  const value = Decimal.sum(0, ...transfers.map((t) => t.value ?? 0));

  return <FiatValue value={value} hideZero={props.hideZero} />;
}
