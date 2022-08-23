import { CardItemProps } from '~/components/card/CardItem';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';

export const WALLET_PAYMENT_CARD_HEIGHT = 160;

export interface WalletPaymentCardSkeletonProps extends CardItemProps {}

export const WalletPaymentCardSkeleton = (
  props: WalletPaymentCardSkeletonProps,
) => (
  <CardItemSkeleton
    icon={false}
    right={false}
    height={WALLET_PAYMENT_CARD_HEIGHT}
    {...props}
  />
);
