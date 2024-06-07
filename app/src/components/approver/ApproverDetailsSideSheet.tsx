import { SideSheet } from '#/SideSheet/SideSheet';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { showError } from '#/provider/SnackbarProvider';
import { FragmentType, gql, useFragment } from '@api';
import { createStyles, useStyles } from '@theme/styles';
import { useForm } from 'react-hook-form';
import { useMutation } from 'urql';

const Update = gql(/* GraphQL */ `
  mutation ApproverDetailsSideSheet_Update($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      id
      name
    }
  }
`);

const Approver = gql(/* GraphQL */ `
  fragment ApproverDetailsSideSheet_UserApprover on UserApprover {
    id
    address
    name
  }
`);

interface Inputs {
  name: string;
}

export interface ApproverDetailsSideSheetProps {
  approver: FragmentType<typeof Approver>;
}

export function ApproverDetailsSideSheet(props: ApproverDetailsSideSheetProps) {
  const { styles } = useStyles(stylesheet);
  const approver = useFragment(Approver, props.approver);
  const update = useMutation(Update)[1];

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: approver.name ?? '' },
  });

  return (
    <SideSheet headline="Details">
      <FormTextField
        label="Approver name"
        control={control}
        name="name"
        containerStyle={styles.field}
        rules={{
          required: true,
          minLength: 1,
          maxLength: 50,
          pattern: { value: /\S+/, message: 'Name cannot contain only whitespace' },
        }}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          requireChanges
          onPress={handleSubmit(async (input) => {
            const r = await update({ input: { address: approver.address, name: input.name } });
            if (r.error) return showError(r.error.message);

            reset(input);
          })}
        >
          Rename
        </FormSubmitButton>
      </Actions>
    </SideSheet>
  );
}

const stylesheet = createStyles(() => ({
  field: {
    margin: 16,
  },
}));
