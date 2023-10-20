import { z } from 'zod';
import { zAddress } from '~/lib/zod';
import { useLocalParams } from '~/hooks/useLocalParams';
import { ContactScreen as SharedContactScreen } from '~/components/shared/ContactScreen';

const ContactScreenParams = z.object({ address: zAddress });

export default function ContactScreen() {
  const params = useLocalParams(`/(drawer)/contacts/[address]`, ContactScreenParams);
  return <SharedContactScreen address={params.address} />;
}
