import { useApproverAddress } from '~/lib/network/useApprover';
import { Address } from 'lib';
import { match } from 'ts-pattern';
import { showError } from '#/provider/SnackbarProvider';
import { hapticFeedback } from '~/lib/haptic';
import { ampli, type RejectionProperties } from '~/lib/ampli';
import { useGetGoogleApprover } from '#/cloud/google/useGetGoogleApprover';
import { useGetAppleApprover } from '#/cloud/useGetAppleApprover';
import { useReject_user$key } from '~/api/__generated__/useReject_user.graphql';
import { useReject_proposal$key } from '~/api/__generated__/useReject_proposal.graphql';
import { graphql, useFragment } from 'react-relay';
import { useMutation } from '~/api';
import { PrivateKeyAccount } from 'viem';
import { signAuthHeaders } from '~/api/auth-manager';
import { useRejectMutation } from '~/api/__generated__/useRejectMutation.graphql';

const User = graphql`
  fragment useReject_user on User {
    id
    approvers {
      id
      address
      details {
        id
        bluetoothDevices
        cloud {
          provider
          subject
        }
      }
    }
  }
`;

const Proposal = graphql`
  fragment useReject_proposal on Proposal {
    __typename
    id
    policy {
      id
      key
      approvers {
        id
      }
    }
    approvals {
      id
      approver {
        id
      }
    }
    rejections {
      id
      createdAt
      approver {
        id
        address
      }
    }
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
    }
  }
`;

const Reject = graphql`
  mutation useRejectMutation($proposal: ID!) @raw_response_type {
    rejectProposal(input: { id: $proposal }) {
      id
      approvals {
        id
      }
      rejections {
        ...RejectionItem_rejection
      }
    }
  }
`;

export interface UseRejectParams {
  user: useReject_user$key;
  proposal: useReject_proposal$key;
  approver?: Address;
}

export function useReject(params: UseRejectParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const getAppleApprover = useGetAppleApprover();
  const getGoogleApprover = useGetGoogleApprover();

  const device = useApproverAddress();
  const approverAddress = params.approver ?? device;
  const approver = user.approvers.find((a) => a.address === approverAddress);

  const rejectMutation = useMutation<useRejectMutation>(Reject, {
    optimisticResponse: approver && {
      rejectProposal: {
        __typename: p.__typename,
        id: p.id,
        approvals: p.approvals.filter((a) => a.approver.id !== approver.id),
        rejections: p.rejections.filter((a) => a.approver.id !== approver.id),
      },
    },
  });

  const canReject =
    p.updatable &&
    !!approver &&
    p.policy.approvers.some((a) => a.id === approver.id) &&
    !p.rejections.some((a) => a.approver.id === approver.id);

  if (!p.updatable || !canReject) return undefined;

  const reject = async (method: RejectionProperties['method'], approver?: PrivateKeyAccount) => {
    hapticFeedback('neutral');

    await rejectMutation(
      { proposal: p.id },
      { headers: approver && (await signAuthHeaders(approver)) },
    );

    const type = p.__typename === 'Transaction' ? 'Transaction' : 'Message';
    ampli.rejection({ method, type });
  };

  if (approverAddress === device) {
    return async () => {
      await reject('Device');
    };
  } else if (approver.details?.cloud) {
    return match(approver.details.cloud)
      .with({ provider: 'Apple' }, ({ subject }) => {
        if (!getAppleApprover) return undefined;

        return async () => {
          const r = await getAppleApprover({ subject });
          if (r.isErr())
            return showError('Failed to approve with Apple account', {
              event: { error: r.error, subject },
            });

          await reject('Apple', r.value);
        };
      })
      .with({ provider: 'Google' }, ({ subject }) => {
        if (!getGoogleApprover) return undefined;

        return async () => {
          const r = await getGoogleApprover(subject);
          if (r.isErr())
            return showError('Failed to approve with Google account', {
              event: { error: r.error, subject },
            });

          await reject('Google', r.value);
        };
      })
      .exhaustive();
  }
}
