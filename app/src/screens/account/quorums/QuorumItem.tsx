import { QuorumGuid } from 'lib';
import { useQuorum } from '~/queries/quroum/useQuorum.api';
import { ListItem } from '~/components/list/ListItem';
import { Addr } from '~/components/addr/Addr';
import { Container } from '~/components/layout/Container';

export interface QuorumItemProps {
  quorum: QuorumGuid;
  onPress?: () => void;
}

export const QuorumItem = ({ quorum: id, onPress }: QuorumItemProps) => {
  const quorum = useQuorum(id);
  const state = quorum.activeOrLatest;

  return (
    <ListItem
      leading={quorum.name}
      headline={quorum.name}
      supporting={({ Text }) => (
        <Container separator={<Text>, </Text>}>
          {[...state.approvers].map((approver) => (
            <Text key={approver}>
              <Addr addr={approver} />
            </Text>
          ))}
        </Container>
      )}
      trailing={`${state.approvers.size} approver${state.approvers.size === 1 ? '' : 's'}`}
      onPress={onPress}
      lines={2}
    />
  );
};
