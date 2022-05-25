import { Address } from 'lib';
import { useWindowDimensions } from 'react-native';
import { useTheme } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';
import { buildAddrLink } from './addrLink';

export interface QrCodeProps {
  addr: Address;
}

export const QrCode = ({ addr }: QrCodeProps) => {
  const { colors } = useTheme();
  const window = useWindowDimensions();

  const link = buildAddrLink({
    target_address: addr,
  });

  return (
    <QRCode
      value={link}
      size={Math.min(window.width, window.height) * 0.8}
      backgroundColor={colors.background}
      ecl="M"
      enableLinearGradient
      linearGradient={[colors.primary, colors.accent]}
    />
  );
};
