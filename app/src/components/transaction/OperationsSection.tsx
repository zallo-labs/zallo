import { FragmentType, gql, useFragment } from '@api';
import { SearchIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { bytesize } from 'lib';
import { slice } from 'viem';
import { ListHeader } from '~/components/list/ListHeader';
import { ListItem } from '~/components/list/ListItem';
import { OperationSection } from '~/components/transaction/OperationSection';

const AlertIcon = materialCommunityIcon('alert-circle-outline');

const TransactionProposal = gql(/* GraphQL */ `
  fragment OperationsSection_TransactionProposal on TransactionProposal {
    id
    operations {
      ...OperationSection_Operation
    }
    simulation {
      id
      success
      responses
    }
    ...OperationSection_TransactionProposal
  }
`);

export interface OperationsSectionProps {
  proposal: FragmentType<typeof TransactionProposal>;
}

export function OperationsSection(props: OperationsSectionProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(TransactionProposal, props.proposal);

  const simulatedErrorSelector =
    p.simulation?.responses.length &&
    bytesize(p.simulation.responses[0]) >= 4 &&
    slice(p.simulation.responses[0], 0, 4);

  const expectedFailureItem = p.simulation?.success === false && (
    <ListItem
      leading={(props) => <AlertIcon {...props} color={styles.error.color} />}
      leadingSize="medium"
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
        <OperationSection
          key={i}
          proposal={p}
          operation={operation}
          initiallyExpanded={p.operations.length === 1}
        />
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
