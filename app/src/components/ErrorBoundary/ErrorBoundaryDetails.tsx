import { View } from 'react-native';
import { createStyles, useStyles } from '@theme/styles';
import { Text } from 'react-native-paper';
import { Actions } from '#/layout/Actions';
import { ICON_SIZE } from '@theme/paper';
import { ReactNode } from 'react';
import { SomethingWrongIcon } from '@theme/icons';
import { NotFound } from '#/NotFound';

export interface ErrorBoundaryDetailsProps {
  error: Error;
  actions: ReactNode;
}

export function ErrorBoundaryDetails({ error, actions }: ErrorBoundaryDetailsProps) {
  const { styles } = useStyles(stylesheet);

  const relayRequiredPath = extraRelayRequiredPath(error);
  if (relayRequiredPath) return <NotFound name={relayRequiredPath} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <SomethingWrongIcon size={ICON_SIZE.large} style={styles.onSurface} />

        <Text variant="headlineMedium" style={styles.onSurface}>
          Something went wrong
        </Text>

        <Text variant="titleLarge" style={styles.tertiary}>
          We have been notified of the issue
        </Text>
      </View>

      <Actions>{actions}</Actions>
    </View>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flex: 1,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  onSurface: {
    color: colors.onSurface,
  },
  tertiary: {
    color: colors.tertiary,
  },
}));

function extraRelayRequiredPath(error: Error) {
  const match = error.message.match(/Relay: Missing @required value at path '([^']+)'/);
  if (!match) return null;

  return match[1];
}
