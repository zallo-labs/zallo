import { makeStyles } from '@theme/makeStyles';
import { StyleProp, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { useAddressLabel } from '~/components/addr/useAddrName';
import { useProposalLabel } from '~/components/call/useProposalLabel';
import { AddressIcon } from '~/components/Identicon/AddressIcon';
import { Box } from '~/components/layout/Box';
import { Proposal } from '@api/proposal';
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
      <AddressIcon addr={p.account} size={styles.iconSize.fontSize} />

      <Text variant="headlineMedium" style={styles.from}>
        {useAddressLabel(p.account)}
      </Text>

      <ProposalMethod proposal={p}>
        <Text variant="headlineSmall" style={styles.label}>
          {label}
        </Text>
      </ProposalMethod>
    </Box>
  );
};

const useStyles = makeStyles(({ iconSize, colors }) => ({
  iconSize: {
    fontSize: iconSize.large,
  },
  from: {
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    color: colors.primary,
  },
}));
