import { Title } from 'react-native-paper';

import { useSafe } from '@features/safe/SafeProvider';
import { Box } from '@components/Box';
import { FormattedAddr } from '@components/FormattedAddr';

export const SafeTitle = () => {
  const safe = useSafe();

  return (
    <Box surface rounded>
      <Title>
        <FormattedAddr addr={safe.contract.address} />
      </Title>
    </Box>
  );
};
