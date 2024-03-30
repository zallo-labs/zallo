import { FragmentType, gql, useFragment } from '@api';
import { SearchIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { bytesize } from 'lib';
import { slice } from 'viem';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { OperationSection } from '#/transaction/OperationSection';
import { ICON_SIZE } from '@theme/paper';

const AlertIcon = materialCommunityIcon('alert-circle-outline');

const Transaction = gql(/* GraphQL */ `
  fragment OperationsSection_Transaction on Transaction {
    id
    operations {
      ...OperationSection_Operation
    }
    simulation {
      id
      success
      responses
    }
    ...OperationSection_Transaction
  }
`);

export interface OperationsSectionProps {
  proposal: FragmentType<typeof Transaction>;
}

export function OperationsSection(props: OperationsSectionProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.proposal);

  const simulatedErrorSelector =
    p.simulation?.responses.length &&
    bytesize(p.simulation.responses[0]) >= 4 &&
    slice(p.simulation.responses[0], 0, 4);

  const expectedFailureItem = p.simulation?.success === false && (
    <ListItem
      leading={<AlertIcon size={ICON_SIZE.medium} color={styles.error.color} />}
      headline={({ Text }) => <Text style={styles.error}>Expected to fail</Text>}
      supporting={
        simulatedErrorSelector
          ? `Error: ${simulatedErrorSelector}`
          : 'No error message was provided'
      }
      trailing={simulatedErrorSelector ? SearchIcon : undefined}
    />
  );

  return (
    <>
      <ListHeader>Operations</ListHeader>

      {p.operations.map((operation, i) => (
        <OperationSection key={i} proposal={p} operation={operation} />
      ))}

      {expectedFailureItem &&
        (simulatedErrorSelector ? (
          <Link
            asChild
            href={`https://openchain.xyz/signatures?query=${simulatedErrorSelector}`}
            target="_blank"
          >
            {expectedFailureItem}
          </Link>
        ) : (
          expectedFailureItem
        ))}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  error: {
    color: colors.error,
  },
}));
