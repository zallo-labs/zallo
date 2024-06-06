import { Button } from '#/Button';
import { Chip } from '#/Chip';
import { Actions } from '#/layout/Actions';
import { ItemList } from '#/layout/ItemList';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { showError } from '#/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '@api';
import { AddIcon, CloseIcon, GroupIcon, UndoIcon, UpdateIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { Address } from 'lib';
import _ from 'lodash';
import { View } from 'react-native';
import { Switch } from 'react-native-paper';
import { useMutation } from 'urql';
import { useImmer } from 'use-immer';
import { getPolicyPresetDetails } from '~/lib/policy/usePolicyPresets';

const Update = gql(/* GraphQL */ `
  mutation ApproverPolicies_Update($input: UpdatePoliciesInput!) {
    updatePolicies(input: $input) {
      id
      threshold
      approvers {
        id
      }
      proposal {
        id
      }
    }
  }
`);

const Account = gql(/* GraphQL */ `
  fragment ApproverPolicies_Account on Account {
    id
    address
    policies {
      id
      key
      name
      threshold
      approvers {
        id
        address
      }
    }
    ...UsePolicyPresets_Account
  }
`);

export interface ApproverPoliciesProps {
  approver: Address;
  account: FragmentType<typeof Account>;
}

export function ApproverPolicies({ approver, ...props }: ApproverPoliciesProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const router = useRouter();
  const updatePolicies = useMutation(Update)[1];
  const add = !account.policies.some((p) => p.approvers.some((a) => a.address === approver));

  const init = Object.fromEntries(
    account.policies.map((p) => {
      const existingMember = p.approvers.some((a) => a.address === approver);

      const presets = getPolicyPresetDetails(p.approvers.length + Number(!existingMember));
      const preset = Object.values(presets).find((preset) => preset.name === p.name);
      return [
        p.id,
        {
          existingMember,
          selected: existingMember,
          threshold: preset
            ? Math.min(Math.max(p.threshold, preset.threshold), p.threshold + 1)
            : p.threshold,
        },
      ];
    }),
  );
  const [pols, updatePols] = useImmer(init);
  const isModified = !_.isEqual(pols, init);

  const update = async () => {
    const modified = Object.entries(pols).filter(([id, v]) => !_.isEqual(init[id], v));
    const r = await updatePolicies({
      input: {
        account: account.address,
        policies: modified.map(([id, v]) => {
          const p = account.policies.find((p) => p.id === id)!;

          return {
            account: account.address,
            key: p.key,
            threshold: v.threshold,
            approvers: v.selected
              ? [...new Set([...p.approvers.map((a) => a.address), approver])]
              : p.approvers.map((a) => a.address).filter((a) => a !== approver),
          };
        }),
      },
    });
    if (r.error) showError('Something went wrong updating policies', { event: { error: r.error } });

    const proposal = r.data?.updatePolicies[0].proposal;
    if (proposal)
      router.push({ pathname: '/(drawer)/transaction/[id]', params: { id: proposal.id } });
  };

  return (
    <View style={styles.container}>
      <ListHeader>Approver of policies</ListHeader>

      <ItemList>
        {account.policies.map((p) => {
          const n = p.approvers.length + Number(!pols[p.id].existingMember);

          return (
            <ListItem
              key={p.id}
              lines={3}
              leading={GroupIcon}
              leadingSize="medium"
              headline={p.name}
              supporting={
                <View style={styles.approvalsContainer}>
                  <Chip
                    mode={pols[p.id].threshold === p.threshold ? 'flat' : 'outlined'}
                    onPress={() =>
                      updatePols((pols) => {
                        pols[p.id].threshold = p.threshold;
                      })
                    }
                    disabled={!pols[p.id].selected}
                  >{`${p.threshold}/${n} approvals`}</Chip>

                  {n > p.threshold && (
                    <Chip
                      mode={pols[p.id].threshold === p.threshold + 1 ? 'flat' : 'outlined'}
                      onPress={() =>
                        updatePols((pols) => {
                          pols[p.id].threshold = p.threshold + 1;
                        })
                      }
                      disabled={!pols[p.id].selected}
                    >{`${p.threshold + 1}/${n} approvals`}</Chip>
                  )}
                </View>
              }
              containerStyle={styles.item}
              trailing={
                <Switch
                  value={pols[p.id].selected}
                  onValueChange={(v) =>
                    updatePols((pols) => {
                      pols[p.id].selected = v;
                    })
                  }
                />
              }
            />
          );
        })}
      </ItemList>

      <Actions horizontal>
        {add
          ? Object.values(pols).some((p) => p.selected) && (
              <Button mode="contained" icon={AddIcon} onPress={update}>
                Add to account
              </Button>
            )
          : isModified &&
            (Object.values(pols).some((p) => p.selected) ? (
              <Button mode="contained" icon={UpdateIcon} onPress={update}>
                Update account
              </Button>
            ) : (
              <Button mode="contained" icon={CloseIcon} onPress={update}>
                Revoke access
              </Button>
            ))}

        {isModified && (
          <Button
            mode="text"
            icon={UndoIcon}
            labelStyle={styles.resetLabel}
            onPress={() => updatePols(init)}
          >
            Reset
          </Button>
        )}
      </Actions>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    gap: 8,
  },
  item: {
    backgroundColor: colors.surface,
  },
  approvalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  resetLabel: {
    color: colors.secondary,
  },
}));
