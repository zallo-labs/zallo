import { useApproverAddress } from '~/lib/network/useApprover';
import { Address, asMessageTypedData, UUID } from 'lib';
import { match } from 'ts-pattern';
import { showError } from '#/Snackbar';
import { proposalAsTypedData } from '~/lib/proposalAsTypedData';
import { useGetLedgerApprover } from '~/app/(sheet)/ledger/approve';
import { useSignWithApprover } from '#/transaction/useSignWithApprover';
import { ampli, type ApprovalProperties } from '~/lib/ampli';
import { hapticFeedback } from '~/lib/haptic';
import { useGetAppleApprover } from '#/cloud/useGetAppleApprover';
import { useGetGoogleApprover } from '#/cloud/google/useGetGoogleApprover';
import { TypedDataDefinition, hashMessage, hashTypedData } from 'viem';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { useApprove_user$key } from '~/api/__generated__/useApprove_user.graphql';
import {
  useApprove_proposal$data,
  useApprove_proposal$key,
} from '~/api/__generated__/useApprove_proposal.graphql';
import { useMutation, UseMutationOptions } from '~/api';
import { useApprove_approveMessageMutation } from '~/api/__generated__/useApprove_approveMessageMutation.graphql';
import {
  ApproveInput,
  useApprove_approveTransactionMutation,
} from '~/api/__generated__/useApprove_approveTransactionMutation.graphql';
import { randomUUID } from '~/lib/id';

graphql`
  fragment useApprove_assignable_approval on Approval @assignable {
    __typename
  }
`;

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
      createdAt
      approver {
        id
        address
      }
      ...ApprovalItem_approval
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
      message
      typedData
    }
    ... on Transaction @alias(as: "proposalAsTypedData") {
      ...proposalAsTypedData_Transaction
    }
  }
`;

const ApproveTransaction = graphql`
  mutation useApprove_approveTransactionMutation($input: ApproveInput!) @raw_response_type {
    approveTransaction(input: $input) {
      __typename
      id
      approvals {
        id
        approver {
          id
          address
        }
        ...ApprovalItem_approval
      }
      rejections {
        id
      }
    }
  }
`;

const ApproveMessage = graphql`
  mutation useApprove_approveMessageMutation($input: ApproveInput!) @raw_response_type {
    approveMessage(input: $input) {
      __typename
      id
      approvals {
        ...ApprovalItem_approval
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
  const getGoogleApprover = useGetGoogleApprover();
  const getAppleApprover = useGetAppleApprover();

  const deviceApprover = useApproverAddress();
  const approverAddress = params.approver ?? deviceApprover;
  const approver = user.approvers.find((a) => a.address === approverAddress);

  const approveTransaction = useMutation<useApprove_approveTransactionMutation>(
    ApproveTransaction,
    approveTransactionMutationParams(approver, p),
  );
  const approveMessage = useMutation<useApprove_approveMessageMutation>(
    ApproveMessage,
    approveMessageMutationParams(approver, p),
  );

  const canApprove =
    p.updatable &&
    approver &&
    p.policy.approvers.some((a) => a.id === approver.id) &&
    !p.approvals.some((a) => a.approver.id === approver.id);

  const proposalData: TypedDataDefinition | undefined =
    p.__typename === 'Transaction'
      ? p.proposalAsTypedData
        ? proposalAsTypedData(p.proposalAsTypedData)
        : undefined
      : asMessageTypedData(
          p.account.address,
          p.typedData ? hashTypedData(p.typedData) : hashMessage(p.message!),
        );
  if (!approver || !p.updatable || !canApprove || !proposalData) return undefined;

  const approve = async (method: ApprovalProperties['method'], input: Omit<ApproveInput, 'id'>) => {
    hapticFeedback('neutral');

    const mutation = p.__typename === 'Transaction' ? approveTransaction : approveMessage;
    const r = await mutation({ input: { ...input, id: p.id } });

    const type = p.__typename === 'Transaction' ? 'Transaction' : 'Message';
    ampli.approval({ method, type });

    return r ? ('approveTransaction' in r ? r.approveTransaction : r.approveMessage) : undefined;
  };

  if (approverAddress === device) {
    return async () => {
      const signature = await signWithDevice.signTypedData(proposalData);

      if (signature.isOk()) return approve('Device', { signature: signature.value });
    };
  } else if (approver.details?.bluetoothDevices?.length) {
    return async () => {
      const { signTypedData } = await getLedgerApprover({ device: approverAddress });
      const signature = await signTypedData(proposalData);

      if (signature) return approve('Ledger', { approver: approverAddress, signature });
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
function approveTransactionMutationParams(
  approver: { id: UUID; address: Address } | undefined,
  p: useApprove_proposal$data,
): UseMutationOptions<useApprove_approveTransactionMutation> | undefined {
  return {
    optimisticResponse: approver && {
      approveTransaction: {
        __typename: 'Transaction',
        id: p.id,
        approvals: [
          ...p.approvals.filter((a) => a.approver.id !== approver.id),
          {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            approver: { id: approver.id, address: approver.address },
          },
        ],
        rejections: p.rejections.filter((a) => a.approver.id !== approver.id),
      },
    },
  };
}

function approveMessageMutationParams(
  approver: { id: UUID; address: Address } | undefined,
  p: useApprove_proposal$data,
): UseMutationOptions<useApprove_approveMessageMutation> | undefined {
  return {
    optimisticResponse: approver && {
      approveMessage: {
        __typename: 'Message',
        id: p.id,
        approvals: [
          ...p.approvals.filter((a) => a.approver.id !== approver.id),
          {
            id: randomUUID(),
            createdAt: new Date().toISOString(),
            approver: { id: approver.id, address: approver.address },
          },
        ],
        rejections: p.rejections.filter((a) => a.approver.id !== approver.id),
      },
    },
  };
}
