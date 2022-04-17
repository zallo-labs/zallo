import { useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import { CHAIN } from '@provider';
import { useSafe } from '../safe/SafeProvider';

// https://eips.ethereum.org/EIPS/eip-681
const getLink = (addr: string) => `ethereum:pay-${addr}@${CHAIN.id}`;

export const SafeQr = () => {
  const safe = useSafe();
  const { colors } = useTheme();
  const window = useWindowDimensions();

  return (
    <QRCode
      value={getLink(safe.contract.address)}
      size={Math.min(window.width, window.height) * 0.8}
      backgroundColor={colors.background}
      ecl="M"
      // color={colors.text}
      enableLinearGradient
      linearGradient={[colors.primary, colors.accent]}
    />
  );
};
