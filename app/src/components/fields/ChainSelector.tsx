import { Card } from '#/layout/Card';
import { CHAINS, Chain } from 'chains';
import { ListItem } from '../list/ListItem';
import { ChainIcon } from '../Identicon/ChainIcon';
import { useState } from 'react';
import { Chevron } from '../Chevron';
import Collapsible from 'react-native-collapsible';
import { SUPPORTED_CHAIN_KEYS } from '@network/chains';
import { ICON_SIZE } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';

const descriptions: Record<Chain, string> = {
  zksync: 'Fast & low-cost layer 2 secured by Ethereum',
  'zksync-sepolia': 'For testing purposes only',
  'zksync-local': 'For testing purposes only',
};

export interface ChainSelectorProps {
  value: Chain;
  onChange: (chain: Chain) => void;
  chains?: Chain[];
}

export function ChainSelector({
  value: selected,
  onChange,
  chains = SUPPORTED_CHAIN_KEYS,
}: ChainSelectorProps) {
  const { styles } = useStyles(stylesheet);

  const [expanded, setExpanded] = useState(false);

  return (
    <Card type="outlined" style={styles.card}>
      <ListItem
        leading={<ChainIcon chain={selected} size={ICON_SIZE.medium} />}
        overline="Network"
        headline={CHAINS[selected].name}
        supporting={descriptions[selected]}
        trailing={<Chevron expanded={expanded} />}
        selected={expanded}
        onPress={() => setExpanded((e) => !e)}
      />

      <Collapsible collapsed={!expanded}>
        {Object.values(chains)
          .filter((c) => c !== selected)
          .map((c) => (
            <ListItem
              key={c}
              leading={<ChainIcon chain={c} size={ICON_SIZE.medium} />}
              headline={CHAINS[c].name}
              supporting={descriptions[c]}
              trailing={<Chevron expanded={expanded} />}
              onPress={() => {
                setExpanded(false);
                onChange(c);
              }}
            />
          ))}
      </Collapsible>
    </Card>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  card: {
    backgroundColor: 'transparent',
    borderColor: colors.outline,
  },
}));
