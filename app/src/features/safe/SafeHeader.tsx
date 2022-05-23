import { Paragraph } from 'react-native-paper';
import { FormattedAddr } from '@components/FormattedAddr';
import { Header } from '@components/Header';
import { SafeIcon } from '@features/home/SafeIcon';
import { useSafe } from '@features/safe/SafeProvider';

export const SafeHeader = () => {
  const { safe } = useSafe();

  return (
    <Header
      Middle={
        <Paragraph style={{ textAlign: 'center' }}>
          <FormattedAddr addr={safe.address} />
        </Paragraph>
      }
      Right={<SafeIcon />}
    />
  );
};
