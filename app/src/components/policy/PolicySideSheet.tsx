import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { usePolicyDraft } from '~/lib/policy/draft';
import { showError } from '#/provider/SnackbarProvider';
import { SideSheet } from '../SideSheet/SideSheet';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { Button } from '../Button';
import { createStyles, useStyles } from '@theme/styles';
import { useEffect } from 'react';

const trimmed = (v: string) => v.trim();

const Account = gql(/* GraphQL */ `
  fragment PolicySideSheet_Account on Account {
    id
    address
  }
`);

const Policy = gql(/* GraphQL */ `
  fragment PolicySideSheet_Policy on Policy {
    id
    key
    draft {
      __typename
      id
    }
  }
`);

const Rename = gql(/* GraphQL */ `
  mutation PolicySideSheet_Rename($account: UAddress!, $key: PolicyKey!, $name: String!) {
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
`);

const Remove = gql(/* GraphQL */ `
  mutation PolicySideSheet_Remove($account: UAddress!, $key: PolicyKey!) {
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
`);

interface Inputs {
  name: string;
}

export interface PolicySideSheetProps {
  account: FragmentType<typeof Account>;
  policy?: FragmentType<typeof Policy> | null;
}

export function PolicySideSheet(props: PolicySideSheetProps) {
  const { styles } = useStyles(stylesheet);
  const account = useFragment(Account, props.account);
  const policy = useFragment(Policy, props.policy);
  const router = useRouter();
  const rename = useMutation(Rename)[1];
  const remove = useMutation(Remove)[1];
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
    <SideSheet headline="Settings" style={styles.sheet}>
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
                const proposal = (await remove({ account: account.address, key: policy.key })).data
                  ?.removePolicy.draft?.proposal;

                if (proposal)
                  router.push({
                    pathname: `/(drawer)/transaction/[id]`,
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
                const r = (await rename({ account: draft.account, key: draft.key, name })).data
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
  sheet: {
    flex: 1,
  },
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
