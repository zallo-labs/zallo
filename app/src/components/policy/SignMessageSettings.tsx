import { ListItem } from '#/list/ListItem';
import { GenericMessageIcon } from '#/message/MessageIcon';
import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { Switch } from 'react-native-paper';
import { usePolicyDraft } from '~/lib/policy/draft';

export function SignMessageSettings() {
  const { styles } = useStyles(stylesheet);
  const [{ allowMessages }, update] = usePolicyDraft();

  return (
    <ListItem
      leading={GenericMessageIcon}
      headline="Sign message"
      supporting="Sign on behalf of the account, such as Sign in with Ethereum"
      trailing={
        <Switch
          value={allowMessages}
          onValueChange={(allow) =>
            update((draft) => {
              draft.allowMessages = allow;
            })
          }
        />
      }
      containerStyle={styles.item}
    />
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
    borderRadius: CORNER.l,
  },
}));
