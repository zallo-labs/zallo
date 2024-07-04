import { useApproverAddress } from '~/lib/network/useApprover';
import { Address, asMessageTypedData } from 'lib';
import { match } from 'ts-pattern';
import { showError } from '#/provider/SnackbarProvider';
import { proposalAsTypedData } from '~/lib/proposalAsTypedData';
import { useGetLedgerApprover } from '~/app/(sheet)/ledger/approve';
import { useSignWithApprover } from '#/transaction/useSignWithApprover';
import { ampli, type ApprovalProperties } from '~/lib/ampli';
import type { ApproveInput } from '@api/generated/graphql';
import { hapticFeedback } from '~/lib/haptic';
import { useGetAppleApprover } from '#/cloud/useGetAppleApprover';
import { useGetGoogleApprover } from '#/cloud/google/useGetGoogleApprover';
import { TypedDataDefinition, hashMessage, hashTypedData } from 'viem';
import { useMemo } from 'react';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { useApprove_user$key } from '~/api/__generated__/useApprove_user.graphql';
import { useApprove_proposal$key } from '~/api/__generated__/useApprove_proposal.graphql';
import { useMutation } from '~/api';
import { useApprove_approveMessageMutation } from '~/api/__generated__/useApprove_approveMessageMutation.graphql';
import { useApprove_approveTransactionMutation } from '~/api/__generated__/useApprove_approveTransactionMutation.graphql';

const User = graphql`
  fragment useApprove_user on User {
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
  fragment useApprove_proposal on Proposal {
    __typename
    id
    account {
      id
      address
    }
    policy {
      id
      approvers {
        id
      }
    }
    approvals {
      id
      approver @required(action: THROW) {
        id
      }
    }
    ... on Transaction {
      updatable
    }
    ... on Message {
      updatable
      message
      typedData
    }
    ...proposalAsTypedData_Transaction
  }
`;

const ApproveTransaction = graphql`
  mutation useApprove_approveTransactionMutation($input: ApproveInput!) {
    approveTransaction(input: $input) {
      __typename
      id
      approvals {
        id
        approver {
          id
          address
        }
      }
      rejections {
        id
      }
    }
  }
`;

const ApproveMessage = graphql`
  mutation useApprove_approveMessageMutation($input: ApproveInput!) {
    approveMessage(input: $input) {
      __typename
      id
      approvals {
        id
        approver {
          id
          address
        }
      }
      rejections {
        id
      }
    }
  }
`;

export interface UseApproveParams {
  user: useApprove_user$key;
  proposal: useApprove_proposal$key;
  approver?: Address;
}

export function useApprove(params: UseApproveParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const device = useApproverAddress();
  const signWithDevice = useSignWithApprover();
  const getLedgerApprover = useGetLedgerApprover();
  const approveTransaction = useMutation<useApprove_approveTransactionMutation>(ApproveTransaction);
  const approveMessage = useMutation<useApprove_approveMessageMutation>(ApproveMessage);
  const getGoogleApprover = useGetGoogleApprover();
  const getAppleApprover = useGetAppleApprover();
  const deviceApprover = useApproverAddress();
  const approver = params.approver ?? deviceApprover;

  console.log({ useApprove: p });

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canApprove =
    p.updatable &&
    !!userApprover &&
    p.policy.approvers.some((a) => a.id === userApprover.id) &&
    !p.approvals.some((a) => a.approver.id === userApprover.id);

  const proposalData: TypedDataDefinition = useMemo(
    () =>
      p.__typename === 'Transaction'
        ? proposalAsTypedData(p)
        : asMessageTypedData(
            p.account!.address,
            p.typedData ? hashTypedData(p.typedData) : hashMessage(p.message!),
          ),
    [p],
  );

  if (!userApprover || !p.updatable || !canApprove) return undefined;

  const approve = async (method: ApprovalProperties['method'], input: Omit<ApproveInput, 'id'>) => {
    hapticFeedback('neutral');

    const mutation = p.__typename === 'Transaction' ? approveTransaction : approveMessage;
    const r = await mutation({ input: { ...input, id: p.id } });

    const type = p.__typename === 'Transaction' ? 'Transaction' : 'Message';
    ampli.approval({ method, type });

    return r ? ('approveTransaction' in r ? r.approveTransaction : r.approveMessage) : undefined;
  };

  if (approver === device) {
    return async () => {
      const signature = await signWithDevice.signTypedData(proposalData);

      if (signature.isOk()) return approve('Device', { signature: signature.value });
    };
  } else if (userApprover.details?.bluetoothDevices?.length) {
    return async () => {
      const { signTypedData } = await getLedgerApprover({ device: approver });
      const signature = await signTypedData(proposalData);

      if (signature) return approve('Ledger', { approver, signature });
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

          const approver = r.value;
          const signature = await approver.signTypedData(proposalData);

          return approve('Apple', { approver: approver.address, signature });
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

          const approver = r.value;
          const signature = await approver.signTypedData(proposalData);

          return approve('Google', { approver: approver.address, signature });
        };
      })
      .exhaustive();
  }
}
