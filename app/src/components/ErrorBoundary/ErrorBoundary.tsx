import { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { Text } from 'react-native-paper';

import * as Sentry from '~/util/sentry/sentry';
import { CloseIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';
import { Appbar } from '../Appbar/Appbar';
import { FormSubmitButton } from '../fields/FormSubmitButton';
import { FormTextField } from '../fields/FormTextField';
import { Actions } from '../layout/Actions';
import { MinimalErrorBoundary } from './MinimalErrorBoundary';

interface Inputs {
  email?: string;
  comments?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
}

export const ErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  const { styles } = useStyles(stylesheet);

  const { control, handleSubmit, resetField } = useForm<Inputs>();

  return (
    <MinimalErrorBoundary
      fallback={({ eventId, error, resetError, componentStack }) => (
        <View style={styles.container}>
          <Appbar
            mode="small"
            leading={(props) => <CloseIcon {...props} onPress={resetError} />}
            headline=""
          />

          <ScrollView
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
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
        </View>
      )}
    >
      {children}
    </MinimalErrorBoundary>
  );
};

const stylesheet = createStyles(({ colors }) => ({
  container: {
    flex: 1,
  },
  contentContainer: {
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
