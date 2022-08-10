import { CardItemProps } from '../card/CardItem';
import { CardItemSkeleton } from '../card/CardItemSkeleton';

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
