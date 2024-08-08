import { SearchIcon, materialCommunityIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { bytesize, isHex } from 'lib';
import { slice } from 'viem';
import { ListHeader } from '#/list/ListHeader';
import { ListItem } from '#/list/ListItem';
import { OperationSection } from '#/transaction/OperationSection';
import { ICON_SIZE } from '@theme/paper';
import { graphql } from 'relay-runtime';
import { OperationsSection_transaction$key } from '~/api/__generated__/OperationsSection_transaction.graphql';
import { useFragment } from 'react-relay';

const AlertIcon = materialCommunityIcon('alert-circle-outline');

const Transaction = graphql`
  fragment OperationsSection_transaction on Transaction {
    id
    operations {
      ...OperationSection_operation
    }
    result {
      __typename
      id
      response
      ... on Failure {
        reason
      }
      ... on SimulatedFailure {
        validationErrors
      }
    }
    ...OperationSection_transaction
  }
`;

export interface OperationsSectionProps {
  transaction: OperationsSection_transaction$key;
}

export function OperationsSection(props: OperationsSectionProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Transaction, props.transaction);

  const errorSelector =
    p.result &&
    isHex(p.result.reason) &&
    bytesize(p.result.reason) >= 4 &&
    slice(p.result.reason, 0, 4);

  return (
    <>
      <ListHeader>Operations</ListHeader>

      {p.operations.map((operation, i) => (
        <OperationSection key={i} transaction={p} operation={operation} />
      ))}

      {p.result?.__typename.includes('Failure') && (
        <>
          {p.result?.reason && (
            <ListItem
              leading={<AlertIcon size={ICON_SIZE.medium} color={styles.error.color} />}
              headline={({ Text }) => <Text style={styles.error}>Expected to fail</Text>}
              supporting={p.result.reason}
            />
          )}

          {p.result.reason &&
            (errorSelector ? (
              <Link
                asChild
                href={`https://openchain.xyz/signatures?query=${errorSelector}`}
                target="_blank"
              >
                <ListItem
                  leading={<AlertIcon size={ICON_SIZE.medium} color={styles.error.color} />}
                  headline={({ Text }) => <Text style={styles.error}>Expected to fail</Text>}
                  supporting={`Error: ${errorSelector}`}
                  trailing={SearchIcon}
                />
              </Link>
            ) : (
              <ListItem
                leading={<AlertIcon size={ICON_SIZE.medium} color={styles.error.color} />}
                headline={({ Text }) => <Text style={styles.error}>Expected to fail</Text>}
                supporting="No error message was provided"
              />
            ))}
        </>
      )}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  error: {
    color: colors.error,
  },
}));
