import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import { Addr } from '~/components/addr/Addr';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { Suspend } from '~/components/Suspender';
import { FiatValue } from '../fiat/FiatValue';
import { ProposableStatusIcon } from '../ProposableStatus/ProposableStatusIcon';
import { useTotalBalanceValue } from '@token/useTotalBalanceValue';

export interface WalletItemCardProps extends CardItemProps {
  id: WalletId;
  showAccount?: boolean;
  inactiveOpacity?: boolean;
}

export const WalletItemCard = withSkeleton(
  ({
    id,
    showAccount = true,
    inactiveOpacity,
    ...props
  }: WalletItemCardProps) => {
    const wallet = useWallet(id);
    const totalFiatValue = useTotalBalanceValue(wallet?.accountAddr);

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
        Right={[
          <ProposableStatusIcon state={wallet.state} />,
          totalFiatValue && (
            <Text variant="bodyLarge">
              <FiatValue value={totalFiatValue} /> available
            </Text>
          ),
        ]}
        opaque={inactiveOpacity && wallet.state.status === 'add'}
        {...props}
      />
    );
  },
  CardItemSkeleton,
);
