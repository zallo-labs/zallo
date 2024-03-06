import { ListItem } from '#/list/ListItem';
import { GenericMessageIcon } from '#/message/MessageIcon';
import { createStyles } from '@theme/styles';
import { Divider, Switch } from 'react-native-paper';
import { usePolicyDraft } from '~/lib/policy/draft';

export interface SignMessageSettingsProps {}

export function SignMessageSettings(_props: SignMessageSettingsProps) {
  const [{ allowMessages }, update] = usePolicyDraft();

  return (
    <>
      <ListItem
        leading={GenericMessageIcon}
        headline="Sign message"
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
      />
      <Divider leftInset style={styles.divider} />
    </>
  );
}

const styles = createStyles({
  divider: {
    marginVertical: 8,
  },
});
