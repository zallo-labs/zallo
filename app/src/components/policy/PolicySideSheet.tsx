import { useForm } from 'react-hook-form';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { usePolicyDraft } from '~/lib/policy/policyAsDraft';
import { showError } from '#/provider/SnackbarProvider';
import { SideSheet } from '../SideSheet/SideSheet';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { Button } from '../Button';
import { createStyles, useStyles } from '@theme/styles';
import { useEffect } from 'react';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { PolicySideSheet_account$key } from '~/api/__generated__/PolicySideSheet_account.graphql';
import { PolicySideSheet_policy$key } from '~/api/__generated__/PolicySideSheet_policy.graphql';
import { useMutation } from '~/api';
import { PolicySideSheet_renameMutation } from '~/api/__generated__/PolicySideSheet_renameMutation.graphql';
import { useRemovePolicy } from '~/hooks/mutations/useRemovePolicy';
import { BOUND_STR_RULES } from '~/util/form.rules';

const trimmed = (v: string) => v.trim();

const Account = graphql`
  fragment PolicySideSheet_account on Account {
    id
    address
  }
`;

const Policy = graphql`
  fragment PolicySideSheet_policy on Policy {
    id
    key
    draft {
      __typename
      id
    }
  }
`;

const Rename = graphql`
  mutation PolicySideSheet_renameMutation($account: UAddress!, $key: PolicyKey!, $name: String!)
  @raw_response_type {
    updatePolicyDetails(input: { account: $account, key: $key, name: $name }) {
      __typename
      ... on Policy {
        id
        name
      }
      ... on Err {
        message
      }
    }
  }
`;

interface Inputs {
  name: string;
}

export interface PolicySideSheetProps {
  account: PolicySideSheet_account$key;
  policy?: PolicySideSheet_policy$key | null;
}

export function PolicySideSheet(props: PolicySideSheetProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const policy = useFragment(Policy, props.policy);
  const rename = useMutation<PolicySideSheet_renameMutation>(Rename);
  const remove = useRemovePolicy();
  const confirmRemove = useConfirmRemoval({
    title: 'Remove policy',
    message: 'Are you sure you want to remove this policy?',
  });

  const [draft, updateDraft] = usePolicyDraft();
  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: draft.name },
  });

  useEffect(() => {
    reset({ name: draft.name });
  }, [draft.name, reset]);

  return (
    <SideSheet headline="Settings">
      <FormTextField
        label="Name"
        control={control}
        name="name"
        containerStyle={styles.field}
        rules={BOUND_STR_RULES}
      />

      <Actions>
        {policy && policy.draft?.__typename !== 'RemovedPolicy' && (
          <Button
            mode="contained"
            style={styles.removeButton}
            labelStyle={styles.removeLabel}
            onPress={async () => {
              if (await confirmRemove()) await remove(account.address, policy.key);
            }}
          >
            Remove policy
          </Button>
        )}

        <FormSubmitButton
          mode="contained"
          control={control}
          requireChanges
          onPress={handleSubmit(async (input) => {
            input.name = trimmed(input.name);
            const { name } = input;

            if (name !== draft.name) {
              if (policy && draft.key !== undefined) {
                const r = (await rename({ account: draft.account, key: draft.key, name }))
                  ?.updatePolicyDetails;
                if (r?.__typename !== 'Policy') return showError(r?.message);
              }

              updateDraft((draft) => {
                draft.name = name;
              });
            }

            reset(input);
          })}
        >
          Rename
        </FormSubmitButton>
      </Actions>
    </SideSheet>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  field: {
    margin: 16,
  },
  removeButton: {
    backgroundColor: colors.errorContainer,
  },
  removeLabel: {
    color: colors.onErrorContainer,
  },
}));
