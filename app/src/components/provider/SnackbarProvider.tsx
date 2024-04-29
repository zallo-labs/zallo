import { createStyles, useStyles } from '@theme/styles';
import { useEffect } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Snackbar, SnackbarProps, Text } from 'react-native-paper';
import RnToast, { ToastConfig, ToastConfigParams, ToastOptions } from 'react-native-toast-message';
import { useMemoApply } from '~/hooks/useMemoized';
import { hapticFeedback } from '~/lib/haptic';
import { LogEventParams, logEvent } from '~/util/analytics';

type SnackVariant = 'info' | 'success' | 'warning' | 'error';

type SnackParams = Pick<SnackbarProps, 'action' | 'style' | 'elevation'> & {
  message: string;
  variant?: SnackVariant;
  messageStyle?: StyleProp<TextStyle>;
  event?: Partial<LogEventParams> | boolean;
};

export type SnackProps = ToastConfigParams<SnackParams>;

const Snack = ({
  isVisible,
  hide,
  props: { message, variant = 'info', messageStyle, event: eventProp, action, style, ...props },
}: SnackProps) => {
  const { styles, theme } = useStyles(useMemoApply(getStylesheet, { variant }));

  useEffect(() => {
    if (variant !== 'info') hapticFeedback(variant);
  }, [variant]);

  useEffect(() => {
    if (eventProp && (variant === 'warning' || variant === 'error')) {
      logEvent({
        level: variant,
        message,
        snack: true,
        ...(typeof eventProp === 'object' && eventProp),
      });
    }
  }, [message, variant, eventProp]);

  return (
    <Snackbar
      {...props}
      visible={isVisible}
      onDismiss={hide}
      duration={Infinity} // Duration is handled by RnToast, mutating isVisible on hide
      theme={theme}
      style={[styles.snackbarBase, styles.snackbar, style]}
      {...(action && {
        action: {
          ...action,
          labelStyle: [styles.actionLabel, action.labelStyle],
        },
      })}
    >
      <Text style={[styles.message, messageStyle]}>{message}</Text>
    </Snackbar>
  );
};

const getStylesheet = ({ variant }: { variant: SnackVariant }) =>
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

export type ShowSnackOptions = Pick<
  ToastOptions,
  'autoHide' | 'visibilityTime' | 'position' | 'onHide'
> &
  Omit<SnackParams, 'message'>;

export const showSnack = (
  message: string,
  { autoHide = true, visibilityTime = 5000, position, onHide, ...props }: ShowSnackOptions = {},
) =>
  RnToast.show({
    type: Snack.name,
    props: {
      ...props,
      message,
    },
    autoHide,
    visibilityTime,
    position,
    onHide,
  });

export const showInfo = (message: string, options?: ShowSnackOptions) =>
  showSnack(message, { ...options, variant: 'info' });

export const showSuccess = (message: string, options?: ShowSnackOptions) =>
  showSnack(message, { ...options, variant: 'success' });

export const showWarning = (message: string, options?: ShowSnackOptions) =>
  showSnack(message, { ...options, variant: 'warning' });

export const showError = (message: string | undefined, options?: ShowSnackOptions) =>
  showSnack(message ?? 'Something went wrong', { ...options, variant: 'error' });

export const hideSnackbar = RnToast.hide;

const CONFIGS: ToastConfig = { [Snack.name]: Snack };

export const SnackbarProvider = () => (
  <RnToast position="bottom" bottomOffset={0} config={CONFIGS} />
);
