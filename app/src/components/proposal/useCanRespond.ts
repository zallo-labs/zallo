import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { APPROVER_BLE_IDS } from '../ledger/useLedger';

const Proposal = gql(/* GraphQL */ `
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

const User = gql(/* GraphQL */ `
  fragment UseCanRespond_User on User {
    id
    approvers {
      id
      address
      bluetoothDevices
    }
  }
`);

export interface CanRespondOptions {
  proposal: FragmentType<typeof Proposal>;
  user: FragmentType<typeof User>;
}

export function useCanRespond(opts: CanRespondOptions) {
  const p = useFragment(Proposal, opts.proposal);
  const user = useFragment(User, opts.user);
  const approver = useApproverAddress();
  const pairedApproverBleIds = useAtomValue(APPROVER_BLE_IDS);

  return useMemo(() => {
    if (p.status !== 'Pending') return { canApprove: [], canReject: [] };

    const policy =
      p.account.policies.find(({ key }) => key === p.policy?.key) ?? p.account.policies[0];

    const availableApprovers = [
      approver,
      ...user.approvers
        .filter((a) => a.bluetoothDevices?.length || pairedApproverBleIds[a.address]?.length)
        .map((a) => a.address),
    ].filter((approver) => policy?.state?.approvers.find((a) => a.address === approver));

    return {
      canApprove: availableApprovers.filter(
        (approver) => !p.approvals.find((a) => a.approver.address === approver),
      ),
      canReject: availableApprovers.filter(
        (approver) => !p.rejections.find((a) => a.approver.address === approver),
      ),
    };
  }, [
    approver,
    p.account.policies,
    p.approvals,
    p.policy?.key,
    p.rejections,
    p.status,
    pairedApproverBleIds,
    user.approvers,
  ]);
}
