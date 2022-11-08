import { ViewIcon } from '@theme/icons';
import { StyleProp, ViewStyle } from 'react-native';
import { Button, Text, TextProps } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposalId } from '~/queries/proposal';

export interface ProposableLabelProps {
  proposal?: ProposalId;
  variant?: TextProps['variant'];
  style?: StyleProp<ViewStyle>;
}

export const ProposableLabel = ({ proposal, variant, style }: ProposableLabelProps) => {
  const { navigate } = useRootNavigation();

  if (!proposal) return null;

  return (
    <Box horizontal justifyContent="space-between" alignItems="center" style={style}>
      <Text variant={variant}>Proposed</Text>

      <Button icon={ViewIcon} onPress={() => navigate('Proposal', { id: proposal })}>
        Proposal
      </Button>
    </Box>
  );
};
