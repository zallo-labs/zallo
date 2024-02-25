import { FragmentType, gql, useFragment } from '@api';
import { authContext } from '@api/client';
import { useApproverAddress } from '~/lib/network/useApprover';
import { Address } from 'lib';
import { match } from 'ts-pattern';
import { useMutation, type OperationContext } from 'urql';
import { showError } from '#/provider/SnackbarProvider';
import { hapticFeedback } from '~/lib/haptic';
import { ampli, type RejectionProperties } from '~/lib/ampli';
import { useGetGoogleApprover } from '#/cloud/google/useGetGoogleApprover';
import { useGetAppleApprover } from '#/cloud/useGetAppleApprover';

const User = gql(/* GraphQL */ `
  fragment UseReject_User on User {
    id
    approvers {
      id
      address
      bluetoothDevices
      cloud {
        id
        provider
        subject
      }
    }
  }
`);

const Proposal = gql(/* GraphQL */ `
  fragment UseReject_Proposal on Proposal {
    id
    potentialRejectors {
      id
    }
    policy {
      id
      key
    }
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
    }
  }
`);

const Reject = gql(/* GraphQL */ `
  mutation useReject_Reject($proposal: UUID!) {
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
`);

export interface UseRejectParams {
  user: FragmentType<typeof User>;
  proposal: FragmentType<typeof Proposal>;
  approver?: Address;
}

export function useReject(params: UseRejectParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const rejectMutation = useMutation(Reject)[1];
  const getAppleApprover = useGetAppleApprover();
  const getGoogleApprover = useGetGoogleApprover();
  const device = useApproverAddress();
  const approver = params.approver ?? device;

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canReject =
    p.updatable && !!userApprover && !!p.potentialRejectors.find((a) => a.id === userApprover.id);

  if (!p.updatable || !canReject) return undefined;

  const reject = async (
    method: RejectionProperties['method'],
    context?: Partial<OperationContext>,
  ) => {
    hapticFeedback('neutral');
    await rejectMutation({ proposal: p.id }, context);

    const type = p.__typename === 'Transaction' ? 'Transaction' : 'Message';
    ampli.rejection({ method, type });
  };

  if (approver === device) {
    return async () => {
      await reject('Device');
    };
  } else if (userApprover.cloud) {
    return match(userApprover.cloud)
      .with({ provider: 'Apple' }, ({ subject }) => {
        if (!getAppleApprover) return undefined;

        return async () => {
          const r = await getAppleApprover({ subject });
          if (r.isErr())
            return showError('Failed to approve with Apple account', {
              event: { error: r.error, subject },
            });

          await reject('Apple', await authContext(r.value.approver));
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

          await reject('Google', await authContext(r.value.approver));
        };
      })
      .exhaustive();
  }
}
