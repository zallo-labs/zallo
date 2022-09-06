import { StyleSheet } from 'react-native';
import { CardItemProps } from '~/components/card/CardItem';
import { CardItemSkeleton } from '~/components/card/CardItemSkeleton';

const WIDTH = 260;
export const WALLET_CARD_STYLE = StyleSheet.create({
  card: {
    width: WIDTH,
    // https://en.wikipedia.org/wiki/Business_card#Dimensions
    height: WIDTH / (88.9 / 50.8), // US size
  },
}).card;

export interface WalletCardSkeletonProps extends CardItemProps {}

export const WalletCardSkeleton = (props: WalletCardSkeletonProps) => (
  <CardItemSkeleton
    icon={false}
    right={false}
    style={WALLET_CARD_STYLE}
    {...props}
  />
);
