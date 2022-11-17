import { Box } from '~/components/layout/Box';
import { useState } from 'react';
import { Pagination } from '~/components/account/AccountSelector/Pagination/Pagination';
import {
  AccountCard,
  AccountCardProps,
} from '~/components/account/AccountSelector/AccountCard/AccountCard';
import { AddAccountCard } from '~/components/account/AccountSelector/AccountCard/AddAccountCard';
import { ACCOUNT_CARD_STYLE } from './AccountCard/AccountCardSkeleton';
import Carousel from 'react-native-snap-carousel';
import { useWindowDimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Address } from 'lib';
import { useAccountIds } from '~/queries/account/useAccountIds.api';

export interface AccountSelectorProps {
  selected: Address;
  onSelect: (account: Address) => void;
  cardProps?: Partial<AccountCardProps>;
}

export const AccountSelector = ({ selected, onSelect, cardProps }: AccountSelectorProps) => {
  const [accountIds] = useAccountIds();
  const window = useWindowDimensions();

  const [position, setPosition] = useState(() => {
    const i = accountIds.findIndex((acc) => acc === selected);
    return i >= 0 ? i : 0;
  });

  return (
    <Box>
      <Carousel
        layout="default"
        data={[...accountIds, null]}
        renderItem={({ item }) =>
          item !== null ? <AccountCard addr={item} {...cardProps} /> : <AddAccountCard />
        }
        itemWidth={ACCOUNT_CARD_STYLE.width}
        sliderWidth={window.width}
        vertical={false}
        firstItem={position}
        onSnapToItem={(index) => {
          setPosition(index);
          const newSelection: Address | undefined = accountIds[index];
          if (newSelection && newSelection !== selected) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(newSelection);
          }
        }}
      />

      <Box horizontal justifyContent="center" mt={3}>
        <Pagination n={accountIds.length + 1} position={position} />
      </Box>
    </Box>
  );
};
