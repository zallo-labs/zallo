import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallet/useWallet';
import { Addr } from '~/components/addr/Addr';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { Suspend } from '~/components/Suspender';
import { useTokenValues } from '@token/useTokenValues';
import { FiatValue } from '../fiat/FiatValue';
import { ProposableStatusIcon } from '../ProposableStatus/ProposableStatusIcon';

export interface WalletCardProps extends CardItemProps {
  id: WalletId;
  showAccount?: boolean;
  inactiveOpacity?: boolean;
}

export const WalletCard = withSkeleton(
  ({ id, showAccount = true, inactiveOpacity, ...props }: WalletCardProps) => {
    const wallet = useWallet(id);
    const { totalFiatValue } = useTokenValues(wallet?.accountAddr);

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
