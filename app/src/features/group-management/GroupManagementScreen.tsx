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
  Id,
  PERCENT_THRESHOLD,
} from 'lib';
import { RootNavigatorScreenProps } from '@features/navigation/RootNavigator';
import { useGroup, useSafe } from '@features/safe/SafeProvider';
import { GroupManagement } from './GroupManagement';
import { ADDR_YUP_SCHEMA } from '@util/yup';
import { withProposeProvider } from '@features/execute/ProposeProvider';
import { useUpsertSafeGroup } from '~/mutations/group/useUpsertGroup.safe';
import { CombinedGroup } from '~/queries/safe';
import { useWallet } from '@features/wallet/useWallet';

type Values = Pick<Group, 'approvers'>;

const getSchema = (groups: CombinedGroup[]): Yup.SchemaOf<Values> =>
  Yup.object({
    approvers: Yup.array()
      .of(
        Yup.object()
          .shape({
            addr: ADDR_YUP_SCHEMA,
            weight: Yup.number()
              .test({
                name: 'min',
                test: (value) => !!value,
                message: 'Approver weight must be > 0',
              })
              .max(100, ({ max }) => `Approver weight must be <= ${max}`)
              .required(),
          })
          .required(),
      )
      .min(1)
      .test(
        'unique',
        'Equivalent group already exists',
        (approvers: Approver[] = []) => {
          const stubGroup: Group = { ref: '', approvers };
          return !groups.find((g) => groupEquiv(g, stubGroup));
        },
      )
      .test(
        'threshold',
        'Group threshold must be >= 100%',
        (approvers: Approver[] = []) =>
          approvers.reduce((acc, a) => acc + a.weight, 0) >= 100,
      ),
  });

export interface GroupManagementScreenParams {
  groupId?: Id;
  // Callbacks
  selected?: Address;
}

export type GroupManagementScreenProps =
  RootNavigatorScreenProps<'GroupManagement'>;

export const GroupManagementScreen = withProposeProvider(
  ({ route }: GroupManagementScreenProps) => {
    const { groupId, selected } = route.params ?? {};
    const { safe, groups } = useSafe();
    const wallet = useWallet();
    const upsertGroup = useUpsertSafeGroup();

    const defaultGroup: CombinedGroup = useMemo(() => {
      const ref = randomGroupRef();
      return {
        id: getGroupId(safe.address, ref),
        ref,
        name: '',
        approvers: [
          {
            addr: wallet.address,
            weight: PERCENT_THRESHOLD,
          },
        ],
        active: true,
      };
    }, [safe.address, wallet.address]);
    const initialGroup = useGroup(groupId) ?? defaultGroup;

    const initialValues: Values = useMemo(
      () => ({ approvers: initialGroup.approvers }),
      [initialGroup],
    );

    const handleSubmit = async (
      values: Values,
      helpers: FormikHelpers<Values>,
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
        initialValues={initialValues}
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
  },
);
