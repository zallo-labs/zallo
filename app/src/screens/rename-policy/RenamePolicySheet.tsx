import { useUpdatePolicy } from '@api/policy';
import { StackNavigatorScreenProps } from '~/navigation/StackNavigator';
import { POLICY_DRAFT_ATOM } from '../policy/PolicyDraft';
import { useImmerAtom } from 'jotai-immer';
import { Screen } from '~/components/layout/Screen';
import { withSuspense } from '~/components/skeleton/withSuspense';
import { ScreenSkeleton } from '~/components/skeleton/ScreenSkeleton';
import { Appbar } from '~/components/Appbar/Appbar';
import { StyleSheet } from 'react-native';
import { useAccount } from '@api/account';
import { useForm } from 'react-hook-form';
import { FormTextField } from '~/components/fields/FormTextField';
import { Actions } from '~/components/layout/Actions';
import { FormSubmitButton } from '~/components/fields/FormSubmitButton';

const trimmed = (v: string) => v.trim();

interface Inputs {
  name: string;
}

export interface RenamePolicyScreenParams {}

export type RenamePolicyScreenProps = StackNavigatorScreenProps<'RenamePolicy'>;

export const RenamePolicyScreen = withSuspense(
  ({ navigation: { goBack } }: RenamePolicyScreenProps) => {
    const updatePolicy = useUpdatePolicy();
    const [draft, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);
    const account = useAccount(draft.account);

    const { control, handleSubmit } = useForm<Inputs>({
      defaultValues: { name: draft.name },
    });

    const takenNames = new Set(
      account?.policies.filter((p) => p.key !== draft.key).map((p) => p.name) ?? [],
    );

    return (
      <Screen>
        <Appbar inset={false} mode="large" leading="close" headline="Rename policy" />

        <FormTextField
          label="Name"
          autoFocus
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
          <FormSubmitButton
            mode="contained"
            control={control}
            onPress={handleSubmit(async ({ name }) => {
              name = trimmed(name);

              if (name !== draft.name) {
                updateDraft((draft) => {
                  draft.name = name;
                });

                if (draft.key !== undefined)
                  await updatePolicy({ account: draft.account, key: draft.key, name });
              }

              goBack();
            })}
          >
            Rename
          </FormSubmitButton>
        </Actions>
      </Screen>
    );
  },
  ScreenSkeleton,
);

const styles = StyleSheet.create({
  field: {
    margin: 16,
  },
});
