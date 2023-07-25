import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useMemo } from 'react';

const FragmentDoc = gql(/* GraphQL */ `
  fragment UseCanRespond_TransactionProposalFragment on TransactionProposal {
    id
    status
    account {
      id
      policies {
        id
        key
        state {
          id
          approvers {
            id
            address
          }
        }
      }
    }
    policy {
      id
      key
    }
    approvals {
      id
      approver {
        id
        address
      }
    }
    rejections {
      id
      approver {
        id
        address
      }
    }
  }
`);

export function useCanRespond(proposal: FragmentType<typeof FragmentDoc>) {
  const p = useFragment(FragmentDoc, proposal);
  const approver = useApproverAddress();

  return useMemo(() => {
    const policy =
      p.account.policies.find(({ key }) => key === p.policy?.key) ?? p.account.policies[0];

    return p.status === 'Pending' && policy?.state?.approvers.find((a) => a.address === approver)
      ? {
          canApprove: !p.approvals.find((a) => a.approver.address === approver),
          canReject: !p.rejections.find((a) => a.approver.address === approver),
        }
      : { canApprove: false, canReject: false };
  }, [approver, p]);
}
