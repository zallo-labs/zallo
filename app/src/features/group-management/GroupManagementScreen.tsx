import { useMemo } from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Address, Group, hashGroup, Approver } from 'lib';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { useGroup, useSafe } from '@features/safe/SafeProvider';
import { GroupManagement } from './GroupManagement';
import { ADDR_YUP_SCHEMA } from '@util/yup';
import { useUpsertGroup } from '~/mutations/useUpsertGroup';
import { CombinedGroup } from '~/queries';

const getSchema = (groups: CombinedGroup[]): Yup.SchemaOf<Group> =>
  Yup.object({
    approvers: Yup.array()
      .of(
        Yup.object()
          .shape({
            addr: ADDR_YUP_SCHEMA,
            weight: Yup.number().min(0).max(100).required(),
          })
          .required(),
      )
      .min(1)
      .test(
        'unique',
        'Group already exists',
        (approvers: Approver[]) =>
          !groups.map((g) => g.hash).includes(hashGroup({ approvers })),
      )
      .test(
        'threshold',
        'Group threshold must be >= 100%',
        (approvers: Approver[]) =>
          approvers.reduce((acc, a) => acc + a.weight, 0) >= 100,
      ),
  });

export interface GroupManagementScreenParams {
  groupId?: string;
  // Callbacks
  selected?: Address;
}

export type GroupManagementScreenProps =
  RootNavigatorScreenProps<'GroupManagement'>;

export const GroupManagementScreen = ({
  route,
}: GroupManagementScreenProps) => {
  const { groupId, selected } = route.params;
  const initialGroup = useGroup(groupId);

  const { groups } = useSafe();
  const upsertGroup = useUpsertGroup();

  const handleSubmit = async (values: Group, helpers: FormikHelpers<Group>) => {
    const newGroup = { ...initialGroup, ...values };
    await upsertGroup(newGroup, initialGroup);

    helpers.setSubmitting(false);
  };

  const schema = useMemo(
    () => getSchema(groups.filter((g) => g.id !== groupId)),
    [groups, groupId],
  );

  return (
    <Formik
      initialValues={{ approvers: initialGroup.approvers }}
      enableReinitialize
      onSubmit={handleSubmit}
      validationSchema={schema}
    >
      {({ values, setFieldValue }) => (
        <GroupManagement
          approvers={values.approvers}
          setApprovers={(approvers) => setFieldValue('approvers', approvers)}
          selected={selected}
          initialGroup={initialGroup}
        />
      )}
    </Formik>
  );
};
