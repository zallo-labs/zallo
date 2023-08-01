import { FragmentType, gql, useFragment } from '@api/generated';
import { tokenToFiat } from 'lib';
import { FiatValue } from '../fiat/FiatValue';

const TransactionProposal = gql(/* GraphQL */ `
  fragment ProposalValue_TransactionProposal on TransactionProposal {
    id
    gasLimit
    feeToken {
      id
      decimals
      gasPrice
      price {
        id
        current
      }
    }
    transaction {
      id
      receipt {
        id
        transferEvents {
          id
          value
        }
      }
    }
    simulation {
      id
      transfers {
        id
        value
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

  const estimatedFeeValue =
    !p.transaction?.receipt &&
    -tokenToFiat(
      BigInt(p.feeToken.gasPrice ?? 0) * BigInt(p.gasLimit),
      p.feeToken.price?.current ?? 0,
      p.feeToken.decimals,
    );

  const transfers = [...(p.transaction?.receipt?.transferEvents ?? p.simulation.transfers)];

  const value = transfers.reduce((sum, t) => sum + (t.value ?? 0), estimatedFeeValue || 0);

  return <FiatValue value={value} hideZero={props.hideZero} />;
}
