import { Addr } from '@components/Addr';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { Suspend } from '@components/Suspender';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { FiatBalance } from '../fiat/FiatBalance';

export interface WalletCardProps extends CardItemProps {
  id: WalletId;
  available?: boolean;
  showAccount?: boolean;
}

export const WalletCard = withSkeleton(
  ({
    id,
    available,
    showAccount = true,
    ...props
  }: WalletCardProps) => {
    const wallet = useWallet(id);

    if (!wallet) return <Suspend />;

    return (
      <CardItem
        Main={[
          <Text variant="titleMedium">{wallet.name}</Text>,
          showAccount && (
            <Text variant="bodySmall">
              <Addr addr={wallet.accountAddr} />
            </Text>
          ),
        ]}
        {...(available && {
          Right: (
            <Text variant="bodyLarge">
              <FiatBalance addr={wallet?.accountAddr} rightAffix=" available" />
            </Text>
          ),
        })}
        {...props}
      />
    );
  },
  CardItemSkeleton,
);
