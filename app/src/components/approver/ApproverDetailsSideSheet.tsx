import { SideSheet } from '#/SideSheet/SideSheet';
import { FormSubmitButton } from '#/fields/FormSubmitButton';
import { FormTextField } from '#/fields/FormTextField';
import { Actions } from '#/layout/Actions';
import { createStyles, useStyles } from '@theme/styles';
import { Chain } from 'chains';
import { asUAddress } from 'lib';
import { useForm } from 'react-hook-form';
import { useFragment } from 'react-relay';
import { graphql, SelectorStoreUpdater } from 'relay-runtime';
import { useMutation } from '~/api';
import { ApproverDetailsSideSheetUpdateQuery } from '~/api/__generated__/ApproverDetailsSideSheetUpdateQuery.graphql';
import {
  ApproverDetailsSideSheet_UpdateMutation,
  ApproverDetailsSideSheet_UpdateMutation$data,
} from '~/api/__generated__/ApproverDetailsSideSheet_UpdateMutation.graphql';
import { ApproverDetailsSideSheet_approver$key } from '~/api/__generated__/ApproverDetailsSideSheet_approver.graphql';
import { BOUND_STR_RULES } from '~/util/form.rules';

const Update = graphql`
  mutation ApproverDetailsSideSheet_UpdateMutation($input: UpdateApproverInput!)
  @raw_response_type {
    updateApprover(input: $input) {
      label
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
  chain: Chain;
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
        rules={BOUND_STR_RULES}
      />

      <Actions>
        <FormSubmitButton
          mode="contained"
          control={control}
          requireChanges
          onPress={handleSubmit(async (input) => {
            const updater: SelectorStoreUpdater<ApproverDetailsSideSheet_UpdateMutation$data> = (
              store,
            ) => {
              const { updatableData } =
                store.readUpdatableQuery<ApproverDetailsSideSheetUpdateQuery>(
                  graphql`
                    query ApproverDetailsSideSheetUpdateQuery($address: UAddress!) @updatable {
                      label(address: $address)
                    }
                  `,
                  { address: asUAddress(approver.address, props.chain) },
                );

              updatableData.label = input.name;
            };

            await update(
              { input: { address: approver.address, name: input.name } },
              {
                optimisticResponse: {
                  updateApprover: {
                    id: approver.id,
                    address: approver.address,
                    label: input.name,
                    details: approver.details && { id: approver.details.id, name: input.name },
                  },
                },
                optimisticUpdater: updater,
                updater,
              },
            );
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
