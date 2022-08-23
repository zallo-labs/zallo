import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Subheading, Title } from 'react-native-paper';
import { ReactNode, useEffect } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { useTheme } from '@theme/paper';
import { Box } from '~/components/layout/Box';

interface FallbackProps {
  resetError: () => void;
}

const Fallback = ({ resetError }: FallbackProps) => {
  const { colors } = useTheme();

  useEffect(() => {
    const timeout = setTimeout(() => resetError(), 10000);

    return () => clearTimeout(timeout);
  }, [resetError]);

  return (
    <Box flex={1} vertical center px={2} backgroundColor={colors.error}>
      <MaterialCommunityIcons
        name="robot-confused"
        size={60}
        color={colors.onSurface}
      />

      <Title>You have encountered an error</Title>
      <Subheading>We have been notified of this issue</Subheading>
    </Box>
  );
};

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    fallback={({ resetError }) => <Fallback resetError={resetError} />}
    onError={(error) => {
      console.error('ErrorBoundary:', error);
    }}
  >
    {children}
  </Sentry.ErrorBoundary>
);
