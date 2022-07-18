import { TokenValue } from '@components/token/TokenValue';
import { ChildrenProps } from '@util/children';
import { BytesLike } from 'ethers';
import { Address } from 'lib';
import { FC } from 'react';
import { useMaybeToken } from '~/token/useToken';
import { useDecodedTransfer } from './useDecodedTransfer';

export interface TransferMethodValueProps {
  children: FC<Required<ChildrenProps>>;
  to: Address;
  data: BytesLike;
}

export const TransferMethodValue = ({
  children: Component,
  to,
  data,
}: TransferMethodValueProps) => {
  const token = useMaybeToken(to);
  const decoded = useDecodedTransfer(to, data);

  if (!token || !decoded) return null;

  return (
    <Component>
      <TokenValue token={token} value={decoded.value} />
    </Component>
  );
};
