import Decimal from 'decimal.js';

import { FragmentType, gql, useFragment } from '~/gql/api/generated';
import { FiatValue } from '../FiatValue';

const TransactionProposal = gql(/* GraphQL */ `
  fragment ProposalValue_TransactionProposal on TransactionProposal {
    id
    transaction {
      id
      receipt {
        id
        transferEvents {
          id
          value
          isFeeTransfer
        }
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
  proposal: FragmentType<typeof TransactionProposal>;
  hideZero?: boolean;
}

export function ProposalValue(props: ProposalValueProps) {
  const p = useFragment(TransactionProposal, props.proposal);

  const transfers = [
    ...(p.transaction?.receipt?.transferEvents ?? p.simulation?.transfers ?? []),
  ].filter((t) => !t.isFeeTransfer);

  const value = Decimal.sum(0, ...transfers.map((t) => t.value ?? 0));

  return <FiatValue value={value} hideZero={props.hideZero} />;
}
