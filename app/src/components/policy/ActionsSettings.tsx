import { ActionIcon, CustomActionIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Switch } from 'react-native-paper';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { useToggle } from '~/hooks/useToggle';
import { PolicyDraftAction, usePolicyDraft } from '~/lib/policy/policyAsDraft';
import { ACTION_PRESETS } from '~/lib/policy/usePolicyPresets';
import { CollapsibleItemList } from '#/layout/CollapsibleItemList';

function isDefaultAllowAction(a: PolicyDraftAction) {
  return a.functions.some((f) => !f.contract && !f.selector);
}

export function ActionsSettings() {
  const { styles } = useStyles(stylesheet);
  const [{ actions }, update] = usePolicyDraft();
  const [expanded, toggleExpanded] = useToggle(false);

  const actionPresets = Object.values(ACTION_PRESETS);

  const defaultAllow = actions.find(isDefaultAllowAction)?.allow;
  const allowedExplicitActions = actions.filter((a) => a.allow && !isDefaultAllowAction(a)).length;

  return (
    <CollapsibleItemList expanded={expanded}>
      <ListItem
        leading={ActionIcon}
        headline="Actions"
        supporting="Things the policy can do"
        trailing={
          <ListItemHorizontalTrailing>
            <ListItemTrailingText>
              {allowedExplicitActions
                ? allowedExplicitActions + (defaultAllow ? '+' : '')
                : defaultAllow
                  ? 'Allowed'
                  : 'Not allowed'}
            </ListItemTrailingText>
            <Chevron expanded={expanded} />
          </ListItemHorizontalTrailing>
        }
        onPress={toggleExpanded}
        containerStyle={styles.item}
      />

      {actions.map((a, i) => (
        <ListItem
          key={i}
          leading={actionPresets.find((p) => p.label === a.label)?.icon ?? CustomActionIcon}
          headline={a.label}
          trailing={
            <Switch
              value={a.allow}
              onValueChange={(allow) => {
                update((draft) => {
                  draft.actions[i].allow = allow;
                });
              }}
            />
          }
          containerStyle={styles.item}
        />
      ))}
    </CollapsibleItemList>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
  },
}));
