import { Paragraph } from 'react-native-paper';

import { Box } from '@components/Box';
import { FormattedAddr } from '@components/FormattedAddr';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { useSafe } from '@features/safe/SafeProvider';
import { GroupItems } from './group/GroupItems';
import { SafeNameField } from './SafeNameField';

export type SafeManagementScreenProps = RootStackScreenProps<'SafeManagement'>;

export const SafeManagementScreen = (_props: SafeManagementScreenProps) => {
  const { safe } = useSafe();

  return (
    <Box flex={1}>
      <Box mt="25%" mx="5%">
        <SafeNameField />

        <Box mt="5%">
          <Paragraph style={{ textAlign: 'center' }}>
            <FormattedAddr addr={safe.address} />
          </Paragraph>
        </Box>
      </Box>

      <Box mt="25%">
        <GroupItems />
      </Box>
    </Box>
  );
};
