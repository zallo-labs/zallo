import { Box } from '@components/Box';
import { RootStackScreenProps } from '@features/navigation/RootNavigation';
import { useSafe } from '@features/safe/SafeProvider';
import { SafeIcon } from '@features/home/SafeIcon';
import { GroupItems } from './group/GroupItems';
import { SafeNameField } from './SafeNameField';
import { Header } from '@components/Header';
import { Paragraph } from 'react-native-paper';
import { FormattedAddr } from '@components/FormattedAddr';

export type SafeManagementScreenProps = RootStackScreenProps<'SafeManagement'>;

export const SafeManagementScreen = (_props: SafeManagementScreenProps) => {
  const { safe } = useSafe();

  return (
    <Box flex={1}>
      <Box mx="5%" mt="5%">
        <Header
          middle={
            <Paragraph>
              <FormattedAddr addr={safe.address} />
            </Paragraph>
          }
          right={<SafeIcon />}
        />

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
