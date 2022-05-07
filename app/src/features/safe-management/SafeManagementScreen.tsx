import { Paragraph } from 'react-native-paper';

import { Box } from '@components/Box';
import { FormattedAddr } from '@components/FormattedAddr';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { useSafe } from '@features/safe/SafeProvider';
import { SafeIcon } from '@features/home/SafeIcon';
import { GroupItems } from './group/GroupItems';
import { SafeNameField } from './SafeNameField';

export type SafeManagementScreenProps = RootStackScreenProps<'SafeManagement'>;

export const SafeManagementScreen = (_props: SafeManagementScreenProps) => {
  const { safe } = useSafe();

  return (
    <Box flex={1}>
      <Box mx="5%" mt="5%">
        <Box horizontal alignItems="center">
          <Box flex={2} horizontal justifyContent="flex-end">
            <Paragraph>
              <FormattedAddr addr={safe.address} />
            </Paragraph>
          </Box>

          <Box flex={1} horizontal justifyContent="flex-end">
            <SafeIcon />
          </Box>
        </Box>

        <Box mt="25%">
          <SafeNameField />
        </Box>
      </Box>

      <Box mt="25%">
        <GroupItems />
      </Box>
    </Box>
  );
};
