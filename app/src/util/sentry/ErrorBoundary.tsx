import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ChildrenProps } from '@util/children';
import { Subheading, Title } from 'react-native-paper';
import { Box } from '../../components/Box';
import { useEffect } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { useTheme } from '@util/theme/paper';

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

export const ErrorBoundary = ({ children }: ChildrenProps) => (
  <Sentry.ErrorBoundary
    fallback={({ resetError }) => <Fallback resetError={resetError} />}
    onError={(error) => {
      console.error('ErrorBoundary:', error);
    }}
  >
    {children}
  </Sentry.ErrorBoundary>
);
