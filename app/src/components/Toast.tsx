import { useTheme } from 'react-native-paper';
import RnToast, {
  BaseToast,
  ToastShowParams,
} from 'react-native-toast-message';

export const showSuccess = (params: ToastShowParams) =>
  RnToast.show({
    ...params,
    type: 'success',
  });

export const showInfo = (params: ToastShowParams) =>
  RnToast.show({
    ...params,
    type: 'info',
  });

export const showError = (params: ToastShowParams) =>
  RnToast.show({
    ...params,
    type: 'error',
  });

export const Toast = () => {
  const { colors } = useTheme();

  return (
    <RnToast
      config={{
        info: (props) => (
          <BaseToast
            {...props}
            style={{
              backgroundColor: colors.primaryContainer,
              borderLeftColor: colors.info,
            }}
            text1Style={{
              color: colors.onPrimaryContainer,
            }}
          />
        ),

        success: (props) => (
          <BaseToast
            {...props}
            style={{
              backgroundColor: colors.primaryContainer,
              borderLeftColor: colors.success,
            }}
            text1Style={{
              color: colors.onPrimaryContainer,
            }}
          />
        ),

        error: (props) => (
          <BaseToast
            {...props}
            style={{
              backgroundColor: colors.primaryContainer,
              borderLeftColor: colors.error,
            }}
            text1Style={{
              color: colors.onPrimaryContainer,
            }}
          />
        ),
      }}
    />
  );
};
