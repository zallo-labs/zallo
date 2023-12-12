import { FragmentType, gql, useFragment } from '@api/generated';
import { FiatValue } from '../FiatValue';
import Decimal from 'decimal.js';

const TransactionProposal = gql(/* GraphQL */ `
  fragment ProposalValue_TransactionProposal on TransactionProposal {
    id
    gasLimit
    feeToken {
      id
      decimals
      estimatedFeesPerGas {
        id
        maxFeePerGas
      }
      price {
        id
        usd {
          id
          current
        }
      }
    }
    transaction {
      id
      maxFeePerGas
      receipt {
        id
        gasUsed
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

  const feeValue = new Decimal(p.transaction?.receipt?.gasUsed.toString() ?? p.gasLimit.toString())
    .mul(p.transaction?.maxFeePerGas ?? p.feeToken.estimatedFeesPerGas?.maxFeePerGas ?? 0)
    .mul(p.feeToken.price?.usd.current ?? 0)
    .neg();

  const transfers = [...(p.transaction?.receipt?.transferEvents ?? p.simulation?.transfers ?? [])];

  const value = Decimal.sum(feeValue, ...transfers.map((t) => t.value ?? 0));

  return <FiatValue value={value} hideZero={props.hideZero} />;
}
