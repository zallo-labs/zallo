import { useToggle } from '@hook/useToggle';
import { DescriptionIcon, ViewIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { hexDataLength } from 'ethers/lib/utils';
import { ReactNode } from 'react';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { IconButton } from 'react-native-paper';
import { Chevron } from '~/components/Chevron';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { Proposal } from '~/queries/proposal';
import { useDecodedRemoveUserMethod } from '../transaction/details/method/user/RemoveUserMethod';
import { useDecodedUpsertUserMethod } from '../transaction/details/method/user/UpsertUserMethod';
import { ProposalTypedData } from './ProposalTypedData';

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
  const upsertedUser = useDecodedUpsertUserMethod(p.account, p);
  const [removedUser] = useDecodedRemoveUserMethod(p.account, p);

  const [expanded, toggleExpanded] = useToggle(false);

  if (hexDataLength(p.data) === 0) return <View style={styles.contentContainer}>{children}</View>;

  if (upsertedUser)
    return (
      <WithIcon
        content={children}
        right={
          <IconButton
            icon={ViewIcon}
            onPress={() =>
              navigate('User', {
                user: upsertedUser.user,
                proposed: { configs: upsertedUser.configs, proposal: p },
              })
            }
          />
        }
      />
    );

  if (removedUser)
    return (
      <WithIcon
        content={children}
        right={
          <IconButton icon={ViewIcon} onPress={() => navigate('User', { user: removedUser })} />
        }
      />
    );

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
