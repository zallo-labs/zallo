import { ProposalableStatus } from '~/components/ProposalableStatus';
import { withSkeleton } from '~/components/skeleton/withSkeleton';
import { Text } from 'react-native-paper';
import { WalletId } from '~/queries/wallets';
import { useWallet } from '~/queries/wallets/useWallet';
import { Addr } from '~/components/addr/Addr';
import { CardItem, CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';
import { FiatBalance } from '../fiat/FiatBalance';
import { Suspend } from '~/components/Suspender';

export interface WalletCardProps extends CardItemProps {
  id: WalletId;
  showAccount?: boolean;
  showInactive?: boolean;
}

export const WalletCard = withSkeleton(
  ({
    id,
    showAccount = true,
    showInactive = true,
    ...props
  }: WalletCardProps) => {
    const wallet = useWallet(id);

    if (!wallet) return <Suspend />;

    if (!showInactive && wallet.state !== 'active') return null;

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
          <Text variant="bodyLarge">
            <FiatBalance addr={wallet.accountAddr} rightAffix=" available" />
          </Text>,
          <ProposalableStatus state={wallet.state} />,
        ]}
        {...props}
      />
    );
  },
  CardItemSkeleton,
);
