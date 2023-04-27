import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { Native as Sentry } from 'sentry-expo';
import { event } from '~/util/analytics';
import { ErrorFeedback } from './ErrorFeedback';

const onError: ComponentPropsWithoutRef<typeof Sentry.ErrorBoundary>['onError'] = (error) => {
  event({ level: 'error', message: error.message, error, context: { errorBoundary: true } });
};

export interface ErrorBoundaryProps
  extends Partial<ComponentPropsWithoutRef<typeof Sentry.ErrorBoundary>> {
  children: ReactNode;
}

export const ErrorBoundary = ({ children, ...props }: ErrorBoundaryProps) => (
  <Sentry.ErrorBoundary onError={onError} fallback={ErrorFeedback} {...props}>
    {children}
  </Sentry.ErrorBoundary>
);
