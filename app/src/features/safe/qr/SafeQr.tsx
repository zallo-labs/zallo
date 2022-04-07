import { useWindowDimensions, Share, Pressable } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import { CHAIN_ID } from '@features/ethers';
import { useSafe } from '../SafeProvider';

// https://eips.ethereum.org/EIPS/eip-681
const getLink = (addr: string) => `ethereum:pay-${addr}@${CHAIN_ID}`;

export const SafeQr = () => {
  const safe = useSafe();
  const { colors } = useTheme();
  const window = useWindowDimensions();

  const link = getLink(safe.contract.address);

  const share = () => {
    Share.share({
      message: link,
      url: link,
    });
  };

  return (
    <Pressable onLongPress={share}>
      <QRCode
        value={link}
        size={Math.min(window.width, window.height) * 0.6}
        backgroundColor={colors.background}
        ecl="M"
        // color={colors.text}
        enableLinearGradient
        linearGradient={[colors.primary, colors.accent]}
      />
    </Pressable>
  );
};
