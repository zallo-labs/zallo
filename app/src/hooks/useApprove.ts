import { FragmentType, gql, useFragment } from '@api';
import { useApproverAddress } from '~/lib/network/useApprover';
import { Address, asMessageTypedData } from 'lib';
import { match } from 'ts-pattern';
import { useMutation } from 'urql';
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

const User = gql(/* GraphQL */ `
  fragment UseApprove_User on User {
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
  fragment UseApprove_Proposal on Proposal {
    __typename
    id
    potentialApprovers {
      id
    }
    ... on TransactionProposal {
      updatable
    }
    ... on MessageProposal {
      updatable
      message
      typedData
      account {
        id
        address
      }
    }
    ...proposalAsTypedData_TransactionProposal
  }
`);

const ApproveTransaction = gql(/* GraphQL */ `
  mutation UseApprove_ApproveTransaction($input: ApproveInput!) {
    approveTransaction(input: $input) {
      __typename
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

const ApproveMessage = gql(/* GraphQL */ `
  mutation UseApprove_ApproveMessage($input: ApproveInput!) {
    approveMessage(input: $input) {
      __typename
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

export interface UseApproveParams {
  user: FragmentType<typeof User>;
  proposal: FragmentType<typeof Proposal>;
  approver?: Address;
}

export function useApprove(params: UseApproveParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const device = useApproverAddress();
  const signWithDevice = useSignWithApprover();
  const getLedgerApprover = useGetLedgerApprover();
  const approveTransaction = useMutation(ApproveTransaction)[1];
  const approveMessage = useMutation(ApproveMessage)[1];
  const getGoogleApprover = useGetGoogleApprover();
  const getAppleApprover = useGetAppleApprover();
  const deviceApprover = useApproverAddress();
  const approver = params.approver ?? deviceApprover;

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canApprove =
    p.updatable && !!userApprover && !!p.potentialApprovers.find((a) => a.id === userApprover.id);

  const proposalData: TypedDataDefinition = useMemo(
    () =>
      p.__typename === 'TransactionProposal'
        ? proposalAsTypedData(p)
        : asMessageTypedData(
            p.account.address,
            p.typedData ? hashTypedData(p.typedData) : hashMessage(p.message),
          ),
    [p],
  );

  if (!userApprover || !p.updatable || !canApprove) return undefined;

  const approve = async (method: ApprovalProperties['method'], input: Omit<ApproveInput, 'id'>) => {
    hapticFeedback('neutral');

    const mutation = p.__typename === 'TransactionProposal' ? approveTransaction : approveMessage;
    const r = await mutation({ input: { ...input, id: p.id } });

    const type = p.__typename === 'TransactionProposal' ? 'Transaction' : 'Message';
    ampli.approval({ method, type });

    return r.data
      ? 'approveTransaction' in r.data
        ? r.data.approveTransaction
        : r.data.approveMessage
      : undefined;
  };

  if (approver === device) {
    return async () => {
      const signature = await signWithDevice.signTypedData(proposalData);

      if (signature.isOk()) return approve('Device', { signature: signature.value });
    };
  } else if (userApprover?.bluetoothDevices?.length) {
    return async () => {
      const { signTypedData } = await getLedgerApprover({ device: approver });
      const signature = await signTypedData(proposalData);

      if (signature) return approve('Ledger', { approver, signature });
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

          const { approver } = r.value;
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

          const { approver } = r.value;
          const signature = await approver.signTypedData(proposalData);

          return approve('Google', { approver: approver.address, signature });
        };
      })
      .exhaustive();
  }
}
