import { FragmentType, gql, useFragment } from '@api';
import { authContext } from '@api/client';
import { useApproverAddress } from '~/lib/network/useApprover';
import { Address } from 'lib';
import { match } from 'ts-pattern';
import { useMutation, type OperationContext } from 'urql';
import { showError } from '~/components/provider/SnackbarProvider';
import { useGetAppleApprover } from '~/hooks/cloud/useGetAppleApprover';
import { useGetGoogleApprover } from '~/hooks/cloud/useGetGoogleApprover';
import { hapticFeedback } from '~/lib/haptic';
import { ampli, type RejectionProperties } from '~/lib/ampli';

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
    ... on TransactionProposal {
      updatable
    }
    ... on MessageProposal {
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
  approver: Address;
}

export function useReject({ approver, ...params }: UseRejectParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const rejectMutation = useMutation(Reject)[1];
  const device = useApproverAddress();
  const getAppleApprover = useGetAppleApprover();
  const getGoogleApprover = useGetGoogleApprover();

  const reject = async (
    method: RejectionProperties['method'],
    context?: Partial<OperationContext>,
  ) => {
    hapticFeedback('neutral');
    await rejectMutation({ proposal: p.id }, context);

    const type = p.__typename === 'TransactionProposal' ? 'Transaction' : 'Message';
    ampli.rejection({ method, type });
  };

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canReject =
    p.updatable && !!userApprover && !!p.potentialRejectors.find((a) => a.id === userApprover.id);

  if (!p.updatable || !canReject) return undefined;

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
          const r = await getGoogleApprover({ subject });
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
