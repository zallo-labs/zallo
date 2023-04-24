import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { ComponentPropsWithoutRef, ReactNode, useEffect } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { makeStyles } from '@theme/makeStyles';
import { Fab } from '~/components/buttons/Fab';
import { RefreshIcon } from '@theme/icons';
import { event } from '~/util/analytics';
import { View } from 'react-native';

const onError: ComponentPropsWithoutRef<typeof Sentry.ErrorBoundary>['onError'] = (error) => {
  event({ level: 'error', message: error.message, error, context: { errorBoundary: true } });
};

interface FallbackProps {
  resetError(): void;
}

const Fallback = ({ resetError }: FallbackProps) => {
  const styles = useStyles();

  useEffect(() => {
    const timeout = setTimeout(() => resetError(), 10000);

    return () => clearTimeout(timeout);
  }, [resetError]);

  return (
    <View style={styles.root}>
      <MaterialCommunityIcons name="robot-confused" size={60} style={styles.onRoot} />

      <Text variant="displaySmall" style={[styles.onRoot, styles.text, styles.title]}>
        Encountered error
      </Text>
      <Text variant="titleLarge" style={[styles.onRoot, styles.text]}>
        We have been notified of this issue
      </Text>

      <Fab icon={RefreshIcon} label="Refresh" onPress={resetError} />
    </View>
  );
};

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    fallback={({ resetError }) => <Fallback resetError={resetError} />}
    onError={onError}
  >
    {children}
  </Sentry.ErrorBoundary>
);

const useStyles = makeStyles(({ colors }) => ({
  root: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    backgroundColor: colors.errorContainer,
  },
  onRoot: {
    color: colors.onErrorContainer,
  },
  text: {
    textAlign: 'center',
  },
  title: {
    marginVertical: 8,
  },
}));
