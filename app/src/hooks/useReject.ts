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
import { signAuthToken } from '~/api/auth-manager';

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
    rejections {
      id
      approver {
        id
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
  mutation useRejectMutation($proposal: ID!) {
    rejectProposal(input: { id: $proposal }) {
      id
      approvals {
        id
      }
      rejections {
        id
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
  const rejectMutation = useMutation(Reject);
  const getAppleApprover = useGetAppleApprover();
  const getGoogleApprover = useGetGoogleApprover();
  const device = useApproverAddress();
  const approver = params.approver ?? device;

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canReject =
    p.updatable &&
    !!userApprover &&
    p.policy.approvers.some((a) => a.id === userApprover.id) &&
    !p.rejections.some((a) => a.approver.id === userApprover.id);

  if (!p.updatable || !canReject) return undefined;

  const reject = async (method: RejectionProperties['method'], approver?: PrivateKeyAccount) => {
    hapticFeedback('neutral');

    await rejectMutation(
      { proposal: p.id },
      { authToken: approver && (await signAuthToken(approver)) },
    );

    const type = p.__typename === 'Transaction' ? 'Transaction' : 'Message';
    ampli.rejection({ method, type });
  };

  if (approver === device) {
    return async () => {
      await reject('Device');
    };
  } else if (userApprover.details?.cloud) {
    return match(userApprover.details.cloud)
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
