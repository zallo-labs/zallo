import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { event } from '~/util/analytics';

type SentryErrorBoundaryProps = ComponentPropsWithoutRef<typeof Sentry.ErrorBoundary>;

export interface MinimalErrorBoundaryProps extends Partial<SentryErrorBoundaryProps> {
  children: ReactNode;
}

export const MinimalErrorBoundary = ({ children, ...props }: MinimalErrorBoundaryProps) => (
  <Sentry.ErrorBoundary
    onError={(error) => {
      event({ level: 'error', message: error.message, error, context: { errorBoundary: true } });
    }}
    {...props}
  >
    {children}
  </Sentry.ErrorBoundary>
);
