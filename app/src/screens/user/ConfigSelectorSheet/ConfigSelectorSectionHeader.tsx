import { ViewIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { UserConfig } from 'lib';
import { Button, Text } from 'react-native-paper';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { ProposalId } from '~/queries/proposal';

export interface UserConfigWithStatus extends UserConfig {
  isActive?: boolean;
}

export interface ConfigSelectorSection {
  title: string;
  data: UserConfigWithStatus[];
  proposal?: ProposalId;
}

export interface ConfigSelectorSectionHeaderProps {
  section: ConfigSelectorSection;
}

export const ConfigSelectorSectionHeader = ({
  section,
}: ConfigSelectorSectionHeaderProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();

  return (
    <Box horizontal alignItems="center">
      <Text variant="labelLarge" style={styles.title}>
        {section.title}
      </Text>

      {section.proposal && (
        <Button
          icon={ViewIcon}
          onPress={() => navigate('Transaction', { id: section.proposal! })}
        >
          Proposal
        </Button>
      )}
    </Box>
  );
};

const useStyles = makeStyles(() => ({
  title: {
    flex: 1,
  },
}));
