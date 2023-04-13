import { useImmerAtom } from 'jotai-immer';
import { Address, Selector, Targets, isAddress } from 'lib';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { ListItem } from '~/components/list/ListItem';
import { FunctionLabel } from '~/components/call/FunctionLabel';
import { FUNCTION_DESCRIPTIONS } from './descriptions';
import { Switch } from 'react-native-paper';
import { ListItemSkeleton } from '~/components/list/ListItemSkeleton';

export interface InteractionItemProps {
  contract: Address | '*';
  selector: Selector;
  targets: Targets;
  interactions: Set<Selector | '*'>;
}

export const InteractionItem = withSuspense(
  ({ contract, selector, targets, interactions }: InteractionItemProps) => {
    const [, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);

    const enabled = targets[contract]
      ? targets[contract].has(selector) || targets[contract].has('*')
      : targets['*'].has(selector) || targets['*'].has('*');

    const handleChange = (enable: boolean) => {
      updateDraft(({ permissions: { targets } }) => {
        if (!targets[contract]) targets[contract] = new Set([]);

        if (enable) {
          targets[contract].add(selector);
        } else {
          targets[contract].delete(selector);

          if (targets[contract].has('*')) {
            targets[contract] = interactions;
            targets[contract].delete('*');
            targets[contract].delete(selector);
          }
        }
      });
    };

    return (
      <ListItem
        headline={
          <FunctionLabel
            contract={isAddress(contract) ? contract : undefined}
            selector={selector}
          />
        }
        supporting={FUNCTION_DESCRIPTIONS[selector]}
        trailing={<Switch value={enabled} onValueChange={handleChange} />}
      />
    );
  },
  (props) => <ListItemSkeleton {...props} trailing />,
);
