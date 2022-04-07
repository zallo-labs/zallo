import { Title } from 'react-native-paper';

import { useSafe } from '@features/safe/SafeProvider';
import { Box } from '@components/Box';
import { FormattedAddr } from '@features/address/FormattedAddr';

export const SafeTitle = () => {
  const safe = useSafe();

  return (
    <Box surface rounded>
      <FormattedAddr addr={safe.contract.address}>
        {({ addr }) => <Title>{addr}</Title>}
      </FormattedAddr>
    </Box>
  );
};
