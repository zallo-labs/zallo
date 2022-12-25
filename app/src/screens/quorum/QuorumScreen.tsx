import { QuorumGuid } from 'lib';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';

export type QuorumScreenParams = {
  quorum: QuorumGuid;
};

export type QuorumScreenProps = RootNavigatorScreenProps<'Quorum'>;

export const QuorumScreen = ({ route }: QuorumScreenProps) => {
  return null;
};
