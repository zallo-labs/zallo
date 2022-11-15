import { makeStyles } from '@theme/makeStyles';
import { useTheme } from '@theme/paper';
import { useEffect } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Snackbar, SnackbarProps, Text } from 'react-native-paper';
import RnToast, { ToastConfig, ToastConfigParams, ToastOptions } from 'react-native-toast-message';
import { match } from 'ts-pattern';
import { captureEvent, SentryEvent } from '~/util/sentry/sentry';

type SnackVariant = 'info' | 'error';

type SnackParams = Pick<SnackbarProps, 'action' | 'style' | 'elevation'> & {
  message: string;
  variant?: SnackVariant;
  messageStyle?: StyleProp<TextStyle>;
  event?: Partial<SentryEvent> | false;
};

export type SnackProps = ToastConfigParams<SnackParams>;

const Snack = ({
  isVisible,
  hide,
  props: { message, variant = 'info', messageStyle, event, action, style, ...props },
}: SnackProps) => {
  const styles = useStyles(variant);

  useEffect(() => {
    if (variant === 'error' && event !== false)
      captureEvent({
        message,
        ...event,
        tags: {
          from: 'snack',
          ...event?.tags,
        },
      });
  }, [message, variant, event]);

  return (
    <Snackbar
      {...props}
      visible={isVisible}
      onDismiss={hide}
      duration={Infinity} // Duration is handled by RnToast, mutating isVisible on hide
      theme={useTheme()}
      style={[styles.snackbar, style]}
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

const useStyles = makeStyles(({ colors }, variant: SnackVariant) => {
  const [backgroundColor, color] = match(variant)
    .with('info', () => [colors.inverseSurface, colors.inverseOnSurface])
    .with('error', () => [colors.errorContainer, colors.onErrorContainer])
    .exhaustive();

  return {
    snackbar: {
      backgroundColor,
    },
    message: {
      color,
    },
    actionLabel: {
      color: colors.primary,
    },
  };
});

export type ShowSnackOptions = Pick<
  ToastOptions,
  'autoHide' | 'visibilityTime' | 'position' | 'onHide'
> &
  Omit<SnackParams, 'message'>;

export const showSnack = (
  message: string,
  { autoHide = true, visibilityTime = 7000, position, onHide, ...props }: ShowSnackOptions = {},
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

export const showError = (message: string, options?: ShowSnackOptions) =>
  showSnack(message, { ...options, variant: 'error' });

export const showWarning = showError;

export const hideSnackbar = RnToast.hide;

const CONFIGS: ToastConfig = { [Snack.name]: Snack };

export const SnackbarProvider = () => (
  <RnToast position="bottom" bottomOffset={10} config={CONFIGS} />
);
