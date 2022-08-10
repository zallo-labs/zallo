import { Addr } from '@components/Addr';
import { FiatValue } from '@components/FiatValue';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { useTokenValues } from '~/token/useTokenValues';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';

export interface WalletCardProps extends CardItemProps {
  id: WalletId;
  available?: boolean;
}

export const WalletCard = withSkeleton(
  ({ id, available, ...props }: WalletCardProps) => {
    const wallet = useWallet(id)!;
    const { totalFiatValue } = useTokenValues(wallet.accountAddr);

    return (
      <CardItem
        Main={[
          <Text variant="titleMedium">{wallet.name}</Text>,
          <Text variant="bodySmall">
            <Addr addr={wallet.accountAddr} />
          </Text>,
        ]}
        {...(available && {
          Right: (
            <Text variant="bodyLarge">
              <FiatValue value={totalFiatValue} /> available
            </Text>
          ),
        })}
        {...props}
      />
    );
  },
  CardItemSkeleton,
);
