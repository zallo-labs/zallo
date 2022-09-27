import { EditIcon, EditOutlineIcon, UserConfigsIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { Address, UserId } from 'lib';
import { useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Button, IconButton, Text } from 'react-native-paper';
import { match } from 'ts-pattern';
import { AddrItem } from '~/components/addr/AddrItem';
import { Card } from '~/components/card/Card';
import { Chevron } from '~/components/Chevron';
import { Box } from '~/components/layout/Box';
import { useRootNavigation } from '~/navigation/useRootNavigation';
import { useUserScreenContext } from './UserScreenContext';

export interface ApproversCardProps {
  user: UserId;
  approvers: Address[];
  onChange: (approvers: Address[]) => void;
  style?: StyleProp<ViewStyle>;
}

export const ApproversCard = ({
  user,
  approvers,
  onChange,
  style,
}: ApproversCardProps) => {
  const styles = useStyles();
  const navigation = useRootNavigation();

  const title = match(approvers.length)
    .with(0, () => 'Without approval')
    .with(1, () => 'Approval required: 1')
    .otherwise(() => `Approvals required: ${approvers.length}`);

  const edit = () =>
    navigation.navigate('Contacts', {
      disabled: [user.addr],
      selectedSet: new Set(approvers),
      onMultiSelect: (contacts) => {
        onChange([...contacts.keys()]);
        navigation.goBack();
      },
    });

  return (
    <Card style={style}>
      <Box horizontal alignItems="center">
        <Text variant="titleLarge" style={styles.title}>
          {title}
        </Text>

        <IconButton
          icon={EditOutlineIcon}
          mode="contained-tonal"
          onPress={edit}
          style={styles.iconButton}
        />
      </Box>

      {approvers.map((addr) => (
        <AddrItem key={addr} addr={addr} style={styles.approver} />
      ))}
    </Card>
  );
};

const useStyles = makeStyles(({ space }) => ({
  title: {
    flex: 1,
  },
  iconButton: {
    marginHorizontal: 0,
  },
  approver: {
    paddingVertical: space(1),
  },
}));
