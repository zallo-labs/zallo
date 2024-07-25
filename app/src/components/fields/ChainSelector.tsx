import { CHAINS, Chain } from 'chains';
import { ListItem } from '../list/ListItem';
import { ChainIcon } from '../Identicon/ChainIcon';
import { SUPPORTED_CHAIN_KEYS } from '@network/chains';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { ItemList, ItemListProps } from '#/layout/ItemList';

const descriptions: Record<Chain, string> = {
  zksync: 'Fast & low-cost layer 2 secured by Ethereum',
  'zksync-sepolia': 'Try out Zallo on a testnet - assets have no value',
  'zksync-local': 'Local development',
};

export interface ChainSelectorProps extends Partial<ItemListProps> {
  value: Chain;
  onChange: (chain: Chain) => void;
}

export function ChainSelector({ value: selected, onChange, ...props }: ChainSelectorProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ItemList {...props}>
      <ListItem
        leading={<ChainIcon chain="zksync" size={ICON_SIZE.medium} />}
        headline={CHAINS['zksync'].name + ' - coming soon'}
        supporting={descriptions['zksync']}
        containerStyle={styles.item}
        disabled
      />

      {SUPPORTED_CHAIN_KEYS.map((c) => (
        <ListItem
          key={c}
          leading={<ChainIcon chain={c} size={ICON_SIZE.medium} />}
          headline={CHAINS[c].name}
          supporting={descriptions[c]}
          selected={selected === c}
          containerStyle={styles.item}
          onPress={() => {
            onChange(c);
          }}
          disabled={selected !== c}
        />
      ))}
    </ItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surfaceContainer.mid,
  },
}));
