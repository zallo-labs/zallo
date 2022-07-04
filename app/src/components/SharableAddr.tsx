import { Address } from 'lib';
import { FC, useCallback, useMemo, useState } from 'react';
import { TouchableRipple } from 'react-native-paper';
import { Share } from 'react-native';
import { truncatedAddr } from '@util/hook/useAddrName';

export interface SharableAddrProps {
  children: FC<{ value: string }>;
  addr: Address;
  initiallyExpanded?: boolean;
}

export const SharableAddr = ({
  children: Component,
  addr,
  initiallyExpanded = false,
}: SharableAddrProps) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpansion = useCallback(() => setExpanded((prev) => !prev), []);
  const share = useCallback(
    () => Share.share({ message: addr, url: addr }),
    [addr],
  );

  const displayed = useMemo(
    () => (expanded ? addr : truncatedAddr(addr)),
    [addr, expanded],
  );

  return (
    <TouchableRipple onPress={share} onLongPress={toggleExpansion}>
      <Component value={displayed} />
    </TouchableRipple>
  );
};
