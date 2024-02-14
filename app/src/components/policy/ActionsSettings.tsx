import { CustomActionIcon, materialIcon } from '@theme/icons';
import { createStyles } from '@theme/styles';
import { Divider, Switch } from 'react-native-paper';
import Collapsible from 'react-native-collapsible';
import { Chevron } from '#/Chevron';
import { ListItem } from '#/list/ListItem';
import { ListItemHorizontalTrailing } from '#/list/ListItemHorizontalTrailing';
import { ListItemTrailingText } from '#/list/ListItemTrailingText';
import { useToggle } from '~/hooks/useToggle';
import { PolicyDraftAction, usePolicyDraftState } from '~/lib/policy/draft';
import { ACTION_PRESETS } from '~/lib/policy/usePolicyPresets';

function isDefaultAllowAction(a: PolicyDraftAction) {
  return a.functions.some((f) => !f.contract && !f.selector);
}

export interface ActionsSettingsProps {
  initiallyExpanded: boolean;
}

export function ActionsSettings(props: ActionsSettingsProps) {
  const [{ actions }, update] = usePolicyDraftState();
  const [expanded, toggleExpanded] = useToggle(props.initiallyExpanded);

  const actionPresets = Object.values(ACTION_PRESETS);

  const defaultAllow = actions.find(isDefaultAllowAction)?.allow;
  const allowedExplicitActions = actions.filter((a) => a.allow && !isDefaultAllowAction(a)).length;

  return (
    <>
      <ListItem
        leading={materialIcon('bolt')}
        headline="Actions"
        trailing={(props) => (
          <ListItemHorizontalTrailing>
            <ListItemTrailingText>
              {allowedExplicitActions
                ? allowedExplicitActions + (defaultAllow ? '+' : '')
                : defaultAllow
                  ? 'Allowed'
                  : 'Not allowed'}
            </ListItemTrailingText>
            <Chevron expanded={expanded} {...props} />
          </ListItemHorizontalTrailing>
        )}
        onPress={toggleExpanded}
      />
      <Collapsible collapsed={!expanded}>
        {actions.map((a, i) => (
          <ListItem
            key={i}
            leading={actionPresets.find((p) => p.label === a.label)?.icon ?? CustomActionIcon}
            headline={a.label}
            trailing={() => (
              <Switch
                value={a.allow}
                onValueChange={(allow) => {
                  update((draft) => {
                    draft.actions[i].allow = allow;
                  });
                }}
              />
            )}
          />
        ))}
      </Collapsible>
      <Divider leftInset style={styles.divider} />
    </>
  );
}

const styles = createStyles({
  divider: {
    marginVertical: 8,
  },
});
