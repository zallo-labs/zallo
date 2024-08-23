import { createStyles, useStyles } from '@theme/styles';
import { useEffect } from 'react';
import { createCallable } from 'react-call';
import { Snackbar as BaseSnackbar, Text } from 'react-native-paper';
import { Subject } from 'rxjs';
import { hapticFeedback } from '~/lib/haptic';
import { logEvent, LogEventParams } from '~/util/analytics';

const HIDE_SNACKBAR = new Subject<true>();

type SnackbarVariant = 'info' | 'success' | 'warning' | 'error';

export interface SnackbarProps {
  variant?: SnackbarVariant;
  message: string;
  duration?: number;
  action?: string;
  event?: Partial<LogEventParams> | boolean;
}

export const Snackbar = createCallable<SnackbarProps, boolean>(
  ({ call, variant = 'info', message, duration = 6000, action, event }) => {
    const { styles } = useStyles(getStylesheet({ variant }));

    useEffect(() => {
      const sub = HIDE_SNACKBAR.subscribe(() => call.end(false));
      return () => sub.unsubscribe();
    }, [call]);

    useEffect(() => {
      if (variant !== 'info') hapticFeedback(variant);
    }, [variant]);

    useEffect(() => {
      if (event && variant !== 'success') {
        logEvent({
          level: variant,
          message,
          snackbar: true,
          ...(typeof event === 'object' && event),
        });
      }
    }, [message, variant, event]);

    return (
      <BaseSnackbar
        elevation={2}
        visible
        duration={duration}
        onDismiss={() => call.end(false)}
        style={[styles.snackbarBase, styles.snackbar]}
        {...(action && {
          action: {
            label: action,
            labelStyle: styles.actionLabel,
            onPress: () => call.end(true),
          },
        })}
      >
        <Text variant="bodyMedium" style={styles.message}>
          {message}
        </Text>
      </BaseSnackbar>
    );
  },
);

const getStylesheet = ({ variant }: { variant: SnackbarVariant }) =>
  createStyles(({ colors }) => {
    const s = {
      info: {
        snackbar: { backgroundColor: colors.inverseSurface },
        message: { color: colors.inverseOnSurface },
        actionLabel: { color: colors.inversePrimary },
      },
      success: {
        snackbar: { backgroundColor: colors.successContainer },
        message: { color: colors.onSuccessContainer },
      },
      warning: {
        snackbar: { backgroundColor: colors.warningContainer },
        message: { color: colors.onWarningContainer },
      },
      error: {
        snackbar: { backgroundColor: colors.errorContainer },
        message: { color: colors.onErrorContainer },
      },
    }[variant];

    return {
      actionLabel: {
        color: colors.primary,
      },
      snackbarBase: {
        maxWidth: 600,
      },
      ...s,
    };
  });

type ShowOptions = Omit<SnackbarProps, 'variant' | 'message'>;

export const showInfo = (message: string, options?: ShowOptions) =>
  Snackbar.call({ variant: 'info', message, ...options });

export const showSuccess = (message: string, options?: ShowOptions) =>
  Snackbar.call({ variant: 'success', message, ...options });

export const showWarning = (message: string, options?: ShowOptions) =>
  Snackbar.call({ variant: 'warning', message, ...options });

export const showError = (message: string, options?: ShowOptions) =>
  Snackbar.call({ variant: 'error', message, ...options });

export const hideSnackbar = () => HIDE_SNACKBAR.next(true);
