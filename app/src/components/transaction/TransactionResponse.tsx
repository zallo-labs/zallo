import { ItemList } from '#/layout/ItemList';
import { ItemListSubheader } from '#/list/ItemListSubheader';
import { ListItem } from '#/list/ListItem';
import { DataIcon, ErrorOutlineIcon, SearchIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { useFragment } from 'react-relay';
import { graphql } from 'relay-runtime';
import { TransactionResponse_transaction$key } from '~/api/__generated__/TransactionResponse_transaction.graphql';
import * as Clipboard from 'expo-clipboard';
import { showInfo } from '#/Snackbar';
import { size, slice } from 'viem';
import { isHex } from 'lib';
import { Link } from 'expo-router';
import { IconButton } from 'react-native-paper';

const Transaction = graphql`
  fragment TransactionResponse_transaction on Transaction {
    id
    result {
      __typename
      response
      ... on Failure {
        reason
      }
      ... on SimulatedFailure {
        validationErrors
      }
    }
  }
`;

const IGNORED_VALIDATION_ERRORS = new Set(['Insufficient approval']);

export interface TransactionResponseProps {
  transaction: TransactionResponse_transaction$key;
}

export function TransactionResponse(props: TransactionResponseProps) {
  const { styles } = useStyles(stylesheet);
  const t = useFragment(Transaction, props.transaction);

  const result = t.result;
  const validationErrors = result?.validationErrors?.filter(
    (e) => !IGNORED_VALIDATION_ERRORS.has(e),
  );
  const errorSelector =
    (isHex(result?.reason) && size(result.reason) >= 4 && slice(result.reason, 0, 4)) || undefined;

  if (!result) return null;

  return (
    <>
      <ItemListSubheader>Response</ItemListSubheader>
      <ItemList>
        {result.reason ? (
          <ListItem
            leading={ErrorOutlineIcon}
            headline={result.reason}
            containerStyle={styles.item}
            trailing={
              errorSelector && (
                <Link
                  href={`https://openchain.xyz/signatures?query=${errorSelector}`}
                  target="_blank"
                  asChild
                >
                  <IconButton icon={SearchIcon} />
                </Link>
              )
            }
          />
        ) : (
          <ListItem
            leading={DataIcon}
            headline="Data"
            supporting={result.response}
            containerStyle={styles.item}
            onPress={() => {
              Clipboard.setStringAsync(result.response);
              showInfo('Data copied');
            }}
          />
        )}

        {validationErrors?.map((error, i) => (
          <ListItem
            key={i}
            leading={ErrorOutlineIcon}
            headline={error}
            containerStyle={styles.item}
          />
        ))}
      </ItemList>
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  item: {
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
}));
