import { FragmentType, gql, useFragment } from '@api';
import { useApproverAddress } from '@network/useApprover';
import { Address } from 'lib';
import { match } from 'ts-pattern';
import { useMutation } from 'urql';
import { useSignWithLedger } from '~/screens/ledger-sign/LedgerSignSheet';
import { proposalAsTypedData } from '~/screens/ledger-sign/proposalAsTypedData';
import { useSignWithApprover } from '~/screens/proposal/useSignWithApprover';
import { useGetCloudApprover } from '~/util/useGetCloudApprover';

const User = gql(/* GraphQL */ `
  fragment UseApprove_User on User {
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
  fragment UseApprove_Proposal on Proposal {
    __typename
    id
    hash
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
    }
    ...UseSignWithApprover_Propsosal
    ...ProposalAsEip712Message_TransactionProposal
  }
`);

const ApproveTransaction = gql(/* GraphQL */ `
  mutation UseApprove_ApproveTransaction($input: ApproveInput!) {
    approveTransaction(input: $input) {
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
  approver: Address;
}

export function useApprove({ approver, ...params }: UseApproveParams) {
  const user = useFragment(User, params.user);
  const p = useFragment(Proposal, params.proposal);
  const device = useApproverAddress();
  const signWithDevice = useSignWithApprover();
  const signWithLedger = useSignWithLedger();
  const approveTransaction = useMutation(ApproveTransaction)[1];
  const approveMessage = useMutation(ApproveMessage)[1];
  const approve = p.__typename === 'TransactionProposal' ? approveTransaction : approveMessage;
  const getCloudApprover = useGetCloudApprover();

  const userApprover = user.approvers.find((a) => a.address === approver);
  const canApprove =
    p.updatable && !!userApprover && !!p.potentialApprovers.find((a) => a.id === userApprover.id);

  if (!p.updatable || !canApprove) return undefined;

  if (approver === device) {
    return async () => {
      const signature = await signWithDevice(p);
      if (signature.isOk()) await approve({ input: { hash: p.hash, signature: signature.value } });
    };
  } else if (userApprover?.bluetoothDevices?.length) {
    return async () => {
      const { signature } = await signWithLedger({
        device: approver,
        content: match(p)
          .with({ __typename: 'TransactionProposal' }, (p) => proposalAsTypedData(p))
          .with({ __typename: 'MessageProposal' }, (p) => p.typedData ?? p.message)
          .exhaustive(),
      });
      await approve({ input: { hash: p.hash, approver, signature } });
    };
  } else if (userApprover?.cloud) {
    return async () => {
      // TODO:
    };
  } else {
    return undefined;
  }
}
