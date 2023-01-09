import { QuorumGuid } from 'lib';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';

export type QuorumScreenParams = {
  quorum: QuorumGuid;
};

export type QuorumScreenProps = StackNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = ({ route }: QuorumScreenProps) => {
  return null;
};
