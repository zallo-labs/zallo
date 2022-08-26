import { StyleSheet } from 'react-native';
import { CardItemProps } from '~/components/card/CardItem';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';

const WIDTH = 260;
export const WALLET_PAYMENT_CARD_STYLE = StyleSheet.create({
  card: {
    width: WIDTH,
    // https://en.wikipedia.org/wiki/Business_card#Dimensions
    height: WIDTH / (88.9 / 50.8), // US size
  },
}).card;

export interface WalletPaymentCardSkeletonProps extends CardItemProps {}

export const WalletPaymentCardSkeleton = (
  props: WalletPaymentCardSkeletonProps,
) => (
  <CardItemSkeleton
    icon={false}
    right={false}
    style={WALLET_PAYMENT_CARD_STYLE}
    {...props}
  />
);
