import { makeStyles } from '@theme/makeStyles';
import { Address } from 'lib';
import { useState } from 'react';
import { Button } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useCreateQuorum } from '~/mutations/quorum/useCreateQuorum.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useAccount } from '~/queries/account/useAccount.api';

export interface CreateQuorumScreenParams {
  account: Address;
}

export type CreateQuorumScreenProps = StackNavigatorScreenProps<'CreateQuorum'>;

export const CreateQuorumScreen = ({ route: { params }, navigation }: CreateQuorumScreenProps) => {
  const styles = useStyles();
  const account = useAccount(params.account);
  const create = useCreateQuorum(account.addr);

  const [name, setName] = useState('');

  return (
    <Box style={styles.root}>
      <AppbarLarge leading={AppbarBack2} headline="Create Quorum" />

      <Box style={styles.container}>
        <TextField
          label="Quorum name"
          placeholder={`Quorum ${account.quorums.length + 1}`}
          autoFocus
          value={name}
          onChangeText={setName}
          containerStyle={styles.input}
        />
      </Box>

      <Button
        mode="contained"
        style={styles.createButton}
        onPress={async () => {
          const { quorum } = await create({ name });
          navigation.replace('Quorum', { quorum });
        }}
      >
        Create
      </Button>
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: s(16),
  },
  input: {
    marginHorizontal: s(16),
  },
  createButton: {
    margin: s(16),
  },
}));
