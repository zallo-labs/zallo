import { makeStyles } from '@theme/makeStyles';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Addr } from '~/components/addr/Addr';
import { useProposalLabel } from '~/components/call/useProposalLabel';
import { AddrIcon } from '~/components/Identicon/AddrIcon';
import { Box } from '~/components/layout/Box';
import { Proposal } from '~/queries/proposal';
import { ProposalMethod } from './ProposalMethod';

export interface ProposalHeaderProps {
  proposal: Proposal;
  style?: StyleProp<ViewStyle>;
}

export const ProposalHeader = ({ proposal: p, style }: ProposalHeaderProps) => {
  const styles = useStyles();
  const label = useProposalLabel(p);

  return (
    <Box alignItems="center" style={style}>
      <AddrIcon addr={p.to} size={styles.iconSize.fontSize} style={styles.icon} />

      <ProposalMethod proposal={p}>
        <Box alignItems="center">
          <Text variant="headlineMedium">
            <Addr addr={p.to} />
          </Text>
          <Text variant="headlineSmall" style={styles.label}>
            {label}
          </Text>
        </Box>
      </ProposalMethod>
    </Box>
  );
};

const useStyles = makeStyles(({ iconSize, colors, typoSpace }) => ({
  iconSize: {
    fontSize: iconSize.large,
  },
  icon: {
    marginBottom: typoSpace(1),
  },
  label: {
    color: colors.primary,
  },
}));
