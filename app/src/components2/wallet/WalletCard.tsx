import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { useTheme } from '@util/theme/paper';
import { Text } from 'react-native-paper';
import { CombinedWallet } from '~/queries/wallets';
import { Balance } from '../Balance';
import { Card, CardProps } from '../card/Card';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { WalletName } from './WalletName';

export interface WalletCardProps extends CardProps {
  wallet: CombinedWallet;
  balance?: boolean;
  large?: boolean;
}

export const WalletCard = withSkeleton(
  ({
    wallet,
    balance = true,
    large = false,
    ...cardProps
  }: WalletCardProps) => {
    const { onBackground } = useTheme();

    const textStyle = {
      color: onBackground(cardProps?.backgroundColor),
    };

    return (
      <Card p={3} {...cardProps} {...(large && { minHeight: 120 })}>
        <Text variant={`title${large ? 'Large' : 'Medium'}`} style={textStyle}>
          <WalletName wallet={wallet} />
        </Text>

        <Box flexGrow={1} horizontal>
          <Text style={[textStyle, { flexGrow: 1 }]} variant="bodyMedium">
            <Addr addr={wallet.accountAddr} />
          </Text>

          {balance && (
            <Box vertical justifyContent="flex-end">
              <Text style={textStyle} variant="bodyLarge">
                <Balance addr={wallet.accountAddr} />
              </Text>
            </Box>
          )}
        </Box>
      </Card>
    );
  },
  CardItemSkeleton,
);
