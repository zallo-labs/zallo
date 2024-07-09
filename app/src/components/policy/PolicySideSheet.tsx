import { useRouter } from 'expo-router';
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
import { PolicySideSheet_removeMutation } from '~/api/__generated__/PolicySideSheet_removeMutation.graphql';

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
  mutation PolicySideSheet_renameMutation($account: UAddress!, $key: PolicyKey!, $name: String!) {
    updatePolicy(input: { account: $account, key: $key, name: $name }) {
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

const Remove = graphql`
  mutation PolicySideSheet_removeMutation($account: UAddress!, $key: PolicyKey!) {
    removePolicy(input: { account: $account, key: $key }) {
      id
      draft {
        id
        proposal {
          id
        }
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
  const router = useRouter();
  const rename = useMutation<PolicySideSheet_renameMutation>(Rename);
  const remove = useMutation<PolicySideSheet_removeMutation>(Remove);
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
        rules={{
          required: true,
          minLength: 1,
          pattern: { value: /\S+/, message: 'Name cannot contain only whitespace' },
        }}
      />

      <Actions>
        {policy && policy.draft?.__typename !== 'RemovedPolicy' && (
          <Button
            mode="contained"
            style={styles.removeButton}
            labelStyle={styles.removeLabel}
            onPress={async () => {
              if (await confirmRemove()) {
                const proposal = (await remove({ account: account.address, key: policy.key }))
                  .removePolicy.draft?.proposal;

                if (proposal)
                  router.push({
                    pathname: `/(nav)/transaction/[id]`,
                    params: { id: proposal.id },
                  });
              }
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
              if (draft.key !== undefined) {
                const r = (await rename({ account: draft.account, key: draft.key, name }))
                  ?.updatePolicy;
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
