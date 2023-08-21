import { FragmentType, gql, useFragment } from '@api/generated';
import { useApproverAddress } from '@network/useApprover';
import { StyleSheet } from 'react-native';
import { Actions } from '~/components/layout/Actions';
import { useSignWithApprover } from '../proposal/useSignWithApprover';
import { useSignWithLedger } from '../ledger-sign/LedgerSignSheet';
import { useCanRespond } from '~/components/proposal/useCanRespond';
import { useMutation } from 'urql';
import { Button } from 'react-native-paper';
import { BluetoothIcon } from '@theme/icons';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageProposalActions_MessageProposal on MessageProposal {
    id
    hash
    message
    ...UseCanRespond_Proposal
    ...UseSignWithApprover_Propsosal
  }
`);

const User = gql(/* GraphQL */ `
  fragment MessageProposalActions_User on User {
    id
    approvers {
      id
      address
      name
    }
    ...UseCanRespond_User
  }
`);

const Approve = gql(/* GraphQL */ `
  mutation MessageProposalActions_Approve($input: ApproveInput!) {
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

const Reject = gql(/* GraphQL */ `
  mutation MessageProposalActions_Reject($proposal: Bytes32!) {
    rejectProposal(input: { hash: $proposal }) {
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

export interface MessageProposalActionsProps {
  proposal: FragmentType<typeof MessageProposal>;
  user: FragmentType<typeof User>;
}

export function MessageProposalActions(props: MessageProposalActionsProps) {
  const p = useFragment(MessageProposal, props.proposal);
  const user = useFragment(User, props.user);
  const approver = useApproverAddress();
  const signWithApprover = useSignWithApprover();
  const signWithLedger = useSignWithLedger();

  const { canApprove, canReject } = useCanRespond({ proposal: p, user });
  const approve = useMutation(Approve)[1];
  const reject = useMutation(Reject)[1];

  return (
    <Actions style={styles.container}>
      {canReject.includes(approver) && (
        <Button onPress={() => reject({ proposal: p.hash })}>Reject</Button>
      )}

      {canApprove
        .filter((a) => a !== approver)
        .map((approver) => (
          <Button
            key={approver}
            mode="contained-tonal"
            icon={BluetoothIcon}
            onPress={async () => {
              const { signature } = await signWithLedger({ device: approver, content: p.message });
              await approve({ input: { hash: p.hash, approver, signature } });
            }}
          >
            Approve with {user.approvers.find((a) => a.address === approver)?.name}
          </Button>
        ))}

      {canApprove.includes(approver) && (
        <Button
          mode="contained"
          onPress={async () => {
            const signature = await signWithApprover(p);
            if (signature.isOk())
              await approve({ input: { hash: p.hash, signature: signature.value } });
          }}
        >
          Approve
        </Button>
      )}
    </Actions>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
});
