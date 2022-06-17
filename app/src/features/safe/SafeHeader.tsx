import { Paragraph } from 'react-native-paper';
import { Addr } from '@components/Addr';
import { Header } from '@components/Header';
import { SafeIcon } from '@features/home/SafeIcon';
import { useSafe } from '@features/safe/SafeProvider';

export const SafeHeader = () => {
  const { safe } = useSafe();

  return (
    <Header
      Middle={
        <Paragraph style={{ textAlign: 'center' }}>
          <Addr addr={safe.address} />
        </Paragraph>
      }
      Right={<SafeIcon />}
    />
  );
};
