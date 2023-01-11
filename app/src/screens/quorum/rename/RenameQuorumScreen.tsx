import { UndoIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { QuorumGuid } from 'lib';
import { useState } from 'react';
import { TextInput } from 'react-native-paper';
import { AppbarBack2 } from '~/components/Appbar/AppbarBack';
import { AppbarLarge } from '~/components/Appbar/AppbarLarge';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useUpdateQuorumMetadata } from '~/mutations/quorum/useUpdateQuorumMetadata.api';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { useQuorum } from '~/queries/quroum/useQuorum.api';

export interface RenameQuorumScreenParams {
  quorum: QuorumGuid;
}

export type RenameQuorumScreenProps = StackNavigatorScreenProps<'RenameQuorum'>;

export const RenameQuorumScreen = ({ route: { params } }: RenameQuorumScreenProps) => {
  const styles = useStyles();
  const quorum = useQuorum(params.quorum);
  const update = useUpdateQuorumMetadata(quorum);

  const [name, setName] = useState(quorum.name);
  const submit = () => update({ name });

  return (
    <Box>
      <AppbarLarge
        leading={(props) => (
          <AppbarBack2
            {...props}
            onPress={(goBack) => {
              submit();
              goBack();
            }}
          />
        )}
        headline="Rename quorum"
      />

      <Box style={styles.fieldsContainer}>
        <TextField
          label="Name"
          value={name}
          onChangeText={setName}
          onSubmitEditing={submit}
          onBlur={submit}
          {...(name !== quorum.name && {
            right: <TextInput.Icon icon={UndoIcon} onPress={() => setName(quorum.name)} />,
          })}
        />
      </Box>
    </Box>
  );
};

const useStyles = makeStyles(({ s }) => ({
  fieldsContainer: {
    marginHorizontal: s(16),
  },
}));
