import { ScrollView, View } from 'react-native';
import { Appbar } from '../Appbar/Appbar';
import { Screen } from '../layout/Screen';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { Actions } from '../layout/Actions';
import { FormSubmitButton } from '../fields/FormSubmitButton';
import { Native as Sentry } from 'sentry-expo';
import { FormTextField } from '../fields/FormTextField';
import { CloseIcon } from '@theme/icons';
import { MinimalErrorBoundary } from './MinimalErrorBoundary';
import { ReactNode } from 'react';

interface Inputs {
  email?: string;
  comments?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const styles = useStyles();

  const { control, handleSubmit, resetField } = useForm<Inputs>();

  return (
    <MinimalErrorBoundary
      fallback={({ eventId, error, resetError, componentStack }) => (
        <Screen>
          <Appbar
            mode="small"
            leading={(props) => <CloseIcon {...props} onPress={resetError} />}
            headline=""
          />

          <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="robot-confused" size={60} style={styles.error} />

              <Text variant="headlineMedium" style={styles.error}>
                Something went wrong
              </Text>

              <Text style={styles.notifiedText}>We have been notified</Text>
            </View>

            <View style={styles.form}>
              <Text>{`If you'd like to help, tell us what happened`}</Text>

              <FormTextField label="Email" control={control} name="email" />

              <FormTextField
                label="What happened?"
                multiline
                autoComplete="off"
                control={control}
                name="comments"
              />
            </View>

            <Actions>
              <FormSubmitButton
                mode="contained"
                control={control}
                onPress={handleSubmit(({ email, comments }) => {
                  if (email || comments) {
                    Sentry.captureUserFeedback({
                      event_id:
                        eventId ||
                        Sentry.captureException(error, {
                          extra: { errorBoundary: true, componentStack },
                        }),
                      name: '',
                      email: email,
                      comments: comments ?? '',
                    });
                  }
                  resetError();

                  // This component will remain mounted, so we need to reset the desired fields
                  resetField('comments');
                })}
              >
                Submit
              </FormSubmitButton>
            </Actions>
          </ScrollView>
        </Screen>
      )}
    >
      {children}
    </MinimalErrorBoundary>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  container: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    gap: 4,
    margin: 16,
  },
  error: {
    color: colors.error,
  },
  notifiedText: {
    color: colors.secondary,
  },
  form: {
    margin: 16,
    gap: 16,
  },
}));
