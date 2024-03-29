import { z } from 'zod';
import { QrModal } from '#/QrModal';
import { useLocalParams } from '~/hooks/useLocalParams';
import { zAddress } from '~/lib/zod';

const ApproverQrModalParams = z.object({ address: zAddress() });

export default function ApproverQrModal() {
  const params = useLocalParams(ApproverQrModalParams);

  return <QrModal address={params.address} />;
}

export { ErrorBoundary } from '#/ErrorBoundary';