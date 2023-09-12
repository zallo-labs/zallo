import { FragmentType, gql, useFragment } from '@api';
import { Address } from 'lib';
import { useMutation } from 'urql';

const User = gql(/* GraphQL */ `
  fragment UseReject_User on User {
    id
    approvers {
      id
      address
      bluetoothDevices
      cloud {
        id
        subject
      }
    }
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment UseReject_Proposal on Proposal {
    id
    hash
    potentialApprovers {
      id
      address
    }
    policy {
      id
      key
    }
    rejections {
      id
      approver {
        id
        address
      }
    }
    ... on TransactionProposal {
      updatable
    }
    ... on MessageProposal {
      updatable
    }
  }
`);

const Reject = gql(/* GraphQL */ `
  mutation useReject_Reject($input: ProposalInput!) {
    rejectProposal(input: $input) {
      id
      approvals {
        id
      }
      rejections {
        id
      }
    }
  }
`);

export interface UseRejectParams {
  user: FragmentType<typeof User>;
  proposal: FragmentType<typeof Proposal>;
  approver: Address;
}

export function useReject({ approver, ...params }: UseRejectParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const reject = useMutation(Reject)[1];

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canReject =
    p.updatable && !!userApprover && !!p.potentialApprovers.find((a) => a.id === userApprover.id);

  if (!p.updatable || !canReject) return undefined;

  return userApprover ? async () => reject({ input: { hash: p.hash } }) : undefined;
}
