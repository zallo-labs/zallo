import { ProposalId } from '@api/proposal';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator2';

export interface ProposalScreenParams {
  proposal: ProposalId;
}

export type ProposalScreenProps = StackNavigatorScreenProps<'Proposal'>;

export const ProposalScreen = (_props: ProposalScreenProps) => null;
