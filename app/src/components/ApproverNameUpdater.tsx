import { useEffect } from 'react';
import { useMutation } from 'urql';

import { useQuery } from '~/gql';
import { gql } from '~/gql/api';
import { getDeviceModel } from '~/lib/device';

const Query = gql(/* GraphQL */ `
  query ApproverNameUpdater {
    approver {
      id
      name
    }
  }
`);

const Update = gql(/* GraphQL */ `
  mutation ApproverNameUpdater_Update($name: String!) {
    updateApprover(input: { name: $name }) {
      id
      name
    }
  }
`);

export function ApproverNameUpdater() {
  const update = useMutation(Update)[1];
  const { approver } = useQuery(Query).data;

  useEffect(() => {
    if (approver && !approver.name) update({ name: getDeviceModel() });
  }, [approver, update]);

  return null;
}
