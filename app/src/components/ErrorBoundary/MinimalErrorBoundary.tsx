import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { logError } from '~/util/analytics';

type SentryErrorBoundaryProps = ComponentPropsWithoutRef<typeof Sentry.ErrorBoundary>;

export interface MinimalErrorBoundaryProps extends Partial<SentryErrorBoundaryProps> {
  children: ReactNode;
}

export const MinimalErrorBoundary = ({ children, ...props }: MinimalErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    onError={(error) => {
      logError(error.message, { error, errorBoundary: true });
    }}
    {...props}
  >
    {children}
  </Sentry.ErrorBoundary>
);
