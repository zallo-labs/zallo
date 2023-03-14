import { useToggle } from '@hook/useToggle';
import { DescriptionIcon, ViewIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ReactNode } from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { IconButton } from 'react-native-paper';
import { Chevron } from '~/components/Chevron';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Proposal } from '@api/proposal';
import { ProposalTypedData } from './ProposalTypedData';
import { useTryDecodeAccountFunctionData } from './useTryDecodeAccountFunctionData';
import { match, P } from 'ts-pattern';

const WithIcon = ({ content, right }: { content: ReactNode; right: ReactNode }) => {
  const styles = useStyles();

  return (
    <Box horizontal alignItems="center">
      <Box style={styles.iconPlaceholder} />
      <Box flex={1} style={styles.contentContainer}>
        {content}
      </Box>
      {right}
    </Box>
  );
};

export interface ProposalMethodProps {
  children: ReactNode;
  proposal: Proposal;
}

export const ProposalMethod = ({ children, proposal: p }: ProposalMethodProps) => {
  const styles = useStyles();
  const { navigate } = useRootNavigation();
  const accountFunction = useTryDecodeAccountFunctionData(p.account, p.data);

  const [expanded, toggleExpanded] = useToggle(false);

  if (!p.data) return <View style={styles.contentContainer}>{children}</View>;

  if (accountFunction)
    return match(accountFunction)
      .with({ type: P.union('addPolicy', 'removePolicy') }, (policy) => (
        <WithIcon
          content={children}
          right={<IconButton icon={ViewIcon} onPress={() => navigate('Policy', { policy })} />}
        />
      ))
      .exhaustive();

  return (
    <>
      <WithIcon
        content={children}
        right={
          <IconButton
            onPress={toggleExpanded}
            icon={expanded ? (props) => <Chevron expanded {...props} /> : DescriptionIcon}
          />
        }
      />

      <Collapsible collapsed={!expanded}>
        <Box style={styles.data}>
          <ProposalTypedData proposal={p} />
        </Box>
      </Collapsible>
    </>
  );
};

const useStyles = makeStyles(({ space, iconButton }) => ({
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'baseline',
  },
  data: {
    marginTop: space(2),
    marginHorizontal: space(2),
  },
  iconPlaceholder: {
    width: iconButton.containerSize + space(1),
  },
}));
