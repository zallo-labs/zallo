import { useTheme } from '@util/theme/paper';
import { useWindowDimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export interface QrCodeProps {
  value: string;
}

export const QrCode = ({ value }: QrCodeProps) => {
  const { colors } = useTheme();
  const window = useWindowDimensions();

  return (
    <QRCode
      value={value}
      size={Math.min(window.width, window.height) * 0.8}
      color={colors.onBackground}
      backgroundColor="transparent"
      ecl="M"
      enableLinearGradient
      linearGradient={[colors.tertiary, colors.primary]}
    />
  );
};
