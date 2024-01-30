import { useRouter } from 'expo-router';
import { useImmerAtom } from 'jotai-immer';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';
import { FragmentType, gql, useFragment } from '@api/generated';
import { useMutation } from 'urql';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { showError } from '~/components/provider/SnackbarProvider';
import { SideSheet, SideSheetProps } from '../SideSheet/SideSheet';
import { useConfirmRemoval } from '~/hooks/useConfirm';
import { Button } from '../Button';
import { createStyles, useStyles } from '@theme/styles';

const trimmed = (v: string) => v.trim();

const Account = gql(/* GraphQL */ `
  fragment PolicySideSheet_Account on Account {
    id
    address
    policies {
      id
      key
      name
    }
  }
`);

const Policy = gql(/* GraphQL */ `
  fragment PolicySideSheet_Policy on Policy {
    id
    key
    draft {
      id
      isRemoved
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

export interface PolicySideSheetProps extends Pick<SideSheetProps, 'visible' | 'close'> {
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

  const [draft, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);
  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: draft.name },
  });

  const takenNames = new Set(
    account?.policies.filter((p) => p.key !== draft.key).map((p) => p.name) ?? [],
  );

  return (
    <SideSheet headline="Settings" style={styles.sheet} {...props}>
      <FormTextField
        label="Name"
        control={control}
        name="name"
        containerStyle={styles.field}
        rules={{
          required: true,
          minLength: 1,
          pattern: {
            value: /\S+/,
            message: 'Name cannot contain only whitespace',
          },
          validate: (value) =>
            !takenNames.has(trimmed(value)) || 'Account already has a policy with this name',
        }}
      />

      <Actions>
        {policy && !policy.draft?.isRemoved && (
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
