import { FragmentType, gql, useFragment } from '@api/generated';
import { ListItem } from '../list/ListItem';
import { useNavigation } from '@react-navigation/native';
import { MessageIcon } from './MessageIcon';

const MessageProposal = gql(/* GraphQL */ `
  fragment MessageProposalItem_MessageProposal on MessageProposal {
    id
    hash
    label
    ...MessageIcon_MessageProposal
  }
`);

export interface MessageProposalItemProps {
  proposal: FragmentType<typeof MessageProposal>;
}

export function MessageProposalItem(props: MessageProposalItemProps) {
  const p = useFragment(MessageProposal, props.proposal);
  const { navigate } = useNavigation();

  return (
    <ListItem
      leading={(props) => <MessageIcon proposal={p} {...props} />}
      leadingSize="medium"
      headline={p.label || 'Signature request'}
      onPress={() => navigate('MessageProposal', { proposal: p.hash })}
    />
  );
}
