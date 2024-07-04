import { Button } from '#/Button';
import { Chip } from '#/Chip';
import { Actions } from '#/layout/Actions';
import { ItemList } from '#/layout/ItemList';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { showError } from '#/provider/SnackbarProvider';
import { AddIcon, CloseIcon, PolicyIcon, UndoIcon, UpdateIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useRouter } from 'expo-router';
import { Address } from 'lib';
import _ from 'lodash';
import { View } from 'react-native';
import { Switch } from 'react-native-paper';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useImmer } from 'use-immer';
import { useMutation } from '~/api';
import { ApproverPoliciesMutation } from '~/api/__generated__/ApproverPoliciesMutation.graphql';
import { ApproverPolicies_account$key } from '~/api/__generated__/ApproverPolicies_account.graphql';
import { PolicyPresetKey, getPolicyPresetDetails } from '~/lib/policy/usePolicyPresets';

const Update = graphql`
  mutation ApproverPoliciesMutation($input: UpdatePoliciesInput!) {
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
`;

const Account = graphql`
  fragment ApproverPolicies_account on Account {
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
    ...usePolicyPresets_account
  }
`;

export interface ApproverPoliciesProps {
  approver: Address;
  account: ApproverPolicies_account$key;
}

export function ApproverPolicies({ approver, ...props }: ApproverPoliciesProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const router = useRouter();
  const updatePolicies = useMutation<ApproverPoliciesMutation>(Update);
  const policies = account.policies.filter((p) => p.key !== PolicyPresetKey.upgrade);
  const add = !policies.some((p) => p.approvers.some((a) => a.address === approver));

  const init = Object.fromEntries(
    policies.map((p) => {
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
          const p = policies.find((p) => p.id === id)!;

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

    const proposal = r.updatePolicies?.[0].proposal;
    if (proposal) router.push({ pathname: '/(nav)/transaction/[id]', params: { id: proposal.id } });
  };

  return (
    <View style={styles.container}>
      <ListHeader>Approver of policies</ListHeader>

      <ItemList>
        {policies.map((p) => {
          const n = p.approvers.length + Number(!pols[p.id]?.existingMember);

          return (
            <ListItem
              key={p.id}
              lines={3}
              leading={PolicyIcon}
              headline={p.name}
              supporting={() => (
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
              )}
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
    columnGap: 8,
    rowGap: 4,
    marginTop: 4,
  },
  resetLabel: {
    color: colors.secondary,
  },
}));
