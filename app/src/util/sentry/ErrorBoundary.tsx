import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text } from 'react-native-paper';
import { ReactNode, useEffect } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { Box } from '~/components/layout/Box';
import { makeStyles } from '@theme/makeStyles';
import { FAB } from '~/components/FAB';
import { RefreshIcon } from '@theme/icons';

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
    <Box flex={1} vertical center style={styles.root}>
      <MaterialCommunityIcons
        name="robot-confused"
        size={60}
        style={styles.onRoot}
      />

      <Text
        variant="displaySmall"
        style={[styles.onRoot, styles.text, styles.title]}
      >
        Encountered error
      </Text>
      <Text variant="titleLarge" style={[styles.onRoot, styles.text]}>
        We have been notified of this issue
      </Text>

      <FAB icon={RefreshIcon} label="Refresh" onPress={resetError} />
    </Box>
  );
};

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    fallback={Fallback}
    onError={(error) => {
      console.error('ErrorBoundary:', error);
    }}
  >
    {children}
  </Sentry.ErrorBoundary>
);

const useStyles = makeStyles(({ colors, space }) => ({
  root: {
    paddingHorizontal: space(2),
    backgroundColor: colors.errorContainer,
  },
  onRoot: {
    color: colors.onErrorContainer,
  },
  text: {
    textAlign: 'center',
  },
  title: {
    marginVertical: space(1),
  },
}));
