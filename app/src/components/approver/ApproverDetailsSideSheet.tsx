import { SideSheet } from '#/SideSheet/SideSheet';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { createStyles, useStyles } from '@theme/styles';
import { useForm } from 'react-hook-form';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { useMutation } from '~/api';
import { ApproverDetailsSideSheet_UpdateMutation } from '~/api/__generated__/ApproverDetailsSideSheet_UpdateMutation.graphql';
import { ApproverDetailsSideSheet_approver$key } from '~/api/__generated__/ApproverDetailsSideSheet_approver.graphql';

const Update = graphql`
  mutation ApproverDetailsSideSheet_UpdateMutation($input: UpdateApproverInput!) {
    updateApprover(input: $input) {
      ...ApproverDetailsSideSheet_approver
    }
  }
`;

const Approver = graphql`
  fragment ApproverDetailsSideSheet_approver on Approver {
    id
    address
    details {
      id
      name
    }
  }
`;

interface Inputs {
  name: string;
}

export interface ApproverDetailsSideSheetProps {
  approver: ApproverDetailsSideSheet_approver$key;
}

export function ApproverDetailsSideSheet(props: ApproverDetailsSideSheetProps) {
  const { styles } = useStyles(stylesheet);
  const approver = useFragment(Approver, props.approver);
  const update = useMutation<ApproverDetailsSideSheet_UpdateMutation>(Update);

  const { control, handleSubmit, reset } = useForm<Inputs>({
    defaultValues: { name: approver.details?.name ?? '' },
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
            await update({ input: { address: approver.address, name: input.name } });
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
