import { useMemo } from 'react';
import { Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import {
  Address,
  Group,
  Approver,
  groupEquiv,
  randomGroupRef,
  getGroupId,
} from 'lib';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { useGroup, useSafe } from '@features/safe/SafeProvider';
import { GroupManagement } from './GroupManagement';
import { ADDR_YUP_SCHEMA } from '@util/yup';
import { CombinedGroup } from '~/queries';
import { withProposeProvider } from '@features/execute/ProposeProvider';
import { useUpsertSafeGroup } from '~/mutations/group/useUpsertSafeGroup';

const getSchema = (groups: CombinedGroup[]): Yup.SchemaOf<Omit<Group, 'ref'>> =>
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
        'Equivalent group already exists',
        (approvers: Approver[]) => {
          const stubGroup: Group = { ref: '', approvers };
          return !groups.find((g) => groupEquiv(g, stubGroup));
        },
      )
      .test(
        'threshold',
        'Group threshold must be >= 100%',
        (approvers: Approver[]) =>
          approvers.reduce((acc, a) => acc + a.weight, 0) >= 100,
      ),
  });

const createDefault = (safe: Address): CombinedGroup => {
  const ref = randomGroupRef();
  return {
    id: getGroupId(safe, ref),
    ref,
    name: '',
    approvers: [],
    active: true,
  };
};

export interface GroupManagementScreenParams {
  groupId?: string;
  // Callbacks
  selected?: Address;
}

export type GroupManagementScreenProps =
  RootNavigatorScreenProps<'GroupManagement'>;

export const GroupManagementScreen = withProposeProvider(
  ({ route }: GroupManagementScreenProps) => {
    const { safe, groups } = useSafe();
    const upsertGroup = useUpsertSafeGroup();

    const defaultGroup = useMemo(() => createDefault(safe.address), [safe]);
    const initialGroup = useGroup(route.params?.groupId) ?? defaultGroup;

    const handleSubmit = async (
      values: Group,
      helpers: FormikHelpers<Group>,
    ) => {
      const newGroup = { ...initialGroup, ...values };
      await upsertGroup(newGroup, initialGroup);

      helpers.setSubmitting(false);
    };

    const schema = useMemo(
      () => getSchema(groups.filter((g) => g.id !== initialGroup.id)),
      [groups, initialGroup],
    );

    return (
      <Formik
        initialValues={initialGroup}
        enableReinitialize
        onSubmit={handleSubmit}
        validationSchema={schema}
      >
        {({ values, setFieldValue }) => (
          <GroupManagement
            approvers={values.approvers}
            setApprovers={(approvers) => setFieldValue('approvers', approvers)}
            selected={route.params?.selected}
            initialGroup={initialGroup}
          />
        )}
      </Formik>
    );
  },
);
