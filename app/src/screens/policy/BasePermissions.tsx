import { useImmerAtom } from 'jotai-immer';
import { POLICY_DRAFT_ATOM } from './PolicyDraft';
import { asSelector, ACCOUNT_ABI, isTargetAllowed, setTargetAllowed } from 'lib';
import { getFunctionSelector, getAbiItem } from 'viem';
import { ListItem } from '~/components/list/ListItem';
import { Switch } from 'react-native-paper';

const policyManagementSelectors = [
  asSelector(getFunctionSelector(getAbiItem({ abi: ACCOUNT_ABI, name: 'addPolicy' }))),
  asSelector(getFunctionSelector(getAbiItem({ abi: ACCOUNT_ABI, name: 'removePolicy' }))),
];

export function BasePermissions() {
  const [{ account, permissions }, updatePolicy] = useImmerAtom(POLICY_DRAFT_ATOM);

  return (
    <>
      <ListItem
        headline="Manage policies"
        trailing={
          <Switch
            value={policyManagementSelectors.every((selector) =>
              isTargetAllowed(permissions.targets, account, selector),
            )}
            onValueChange={(enable) => {
              updatePolicy((draft) => {
                policyManagementSelectors.every((selector) =>
                  setTargetAllowed(draft.permissions.targets, account, selector, enable),
                );
              });
            }}
          />
        }
      />

      <ListItem
        headline="Spend unlisted tokens"
        trailing={
          <Switch
            value={permissions.transfers.defaultAllow}
            onValueChange={(enabled) =>
              updatePolicy((draft) => {
                draft.permissions.transfers.defaultAllow = enabled;
              })
            }
          />
        }
      />

      <ListItem
        headline="Interact with unlisted contracts"
        trailing={
          <Switch
            value={permissions.targets.default.defaultAllow}
            onValueChange={(enabled) =>
              updatePolicy((draft) => {
                draft.permissions.targets.default.defaultAllow = enabled;
              })
            }
          />
        }
      />
    </>
  );
}
