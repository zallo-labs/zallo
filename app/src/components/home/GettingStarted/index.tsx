import { gql } from '@api';
import { StyleProp, ViewStyle } from 'react-native';
import { useLinkGoogleSuggestion } from './useLinkGoogleSuggestion';
import { useLinkDeviceSuggestion } from './useLinkDeviceSuggestion';
import { useLinkAppleSuggestion } from './useLinkAppleSuggestion';
import { CheckIcon } from '@theme/icons';
import { useTransferSuggestion } from './useTransferSuggestion';
import { useDepositSuggestion } from './useDepositSuggestion';
import { useAtom } from 'jotai';
import { persistedAtom } from '~/lib/persistedAtom';
import { ReactNode, memo } from 'react';
import { useCreatePolicySuggestion } from '#/home/GettingStarted/useCreatePolicySuggestion';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ProgressBar, Surface, Text, TouchableRipple } from 'react-native-paper';
import Animated, { FadeIn, SlideOutRight } from 'react-native-reanimated';
import { Button } from '#/Button';
import { Chevron } from '#/Chevron';
import { FormattedNumber } from '#/format/FormattedNumber';
import { UAddress } from 'lib';
import { useQuery } from '~/gql';
import { withSuspense } from '#/skeleton/withSuspense';

const Query = gql(/* GraphQL */ `
  query GettingStarted($account: UAddress!) {
    user {
      id
      ...useLinkDeviceSuggestion_User
      ...useLinkGoogleSuggestion_User
      ...useLinkAppleSuggestion_User
    }

    account(input: { account: $account }) {
      id
      ...useDepositSuggestion_Account
      ...useCreatePolicySuggestion_Account
      ...useTransferSuggestion_Account
    }
  }
`);

const expandedAtom = persistedAtom<boolean>('getting-started.expanded', false);
const dismissedAtom = persistedAtom<boolean>('getting-started.dismissed', false);

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export interface GettingStartedProps {
  account: UAddress;
  style?: StyleProp<ViewStyle>;
  then?: ReactNode;
}

function GettingStarted_({ style, then, ...props }: GettingStartedProps) {
  const { styles } = useStyles(stylesheet);

  const query = useQuery(Query, { account: props.account }).data;
  const { user, account } = query;

  const [expanded, setExpanded] = useAtom(expandedAtom);
  const [dismissed, setDismissed] = useAtom(dismissedAtom);

  const suggestions = [
    useLinkGoogleSuggestion({ user }),
    useLinkAppleSuggestion({ user }),
    useLinkDeviceSuggestion({ user }),
    useDepositSuggestion({ account }),
    useCreatePolicySuggestion({ account }),
    useTransferSuggestion({ account }),
  ].filter(Boolean);

  const complete = suggestions.filter((s) => s.complete);
  const progress = complete.length / suggestions.length;

  if (progress === 1 || dismissed) return then;

  return (
    <AnimatedSurface style={[styles.surface, style]} entering={FadeIn} exiting={SlideOutRight}>
      <TouchableRipple style={styles.overview(expanded)} onPress={() => setExpanded((v) => !v)}>
        <>
          <View style={styles.headerContainer}>
            <Text variant="titleSmall" style={[styles.text, styles.title]}>
              Getting started
            </Text>

            <Text variant="bodyMedium" style={styles.text}>
              <FormattedNumber style="percent" value={progress} /> complete
            </Text>

            <Chevron expanded={expanded} />
          </View>

          <ProgressBar progress={progress} style={styles.progress} />
        </>
      </TouchableRipple>

      <Collapsible collapsed={!expanded}>
        {suggestions.map(({ Item, complete }, i) => (
          <Item
            key={i}
            {...(complete && {
              disabled: true,
              trailing: CheckIcon,
            })}
          />
        ))}

        <View style={styles.actions}>
          <Button mode="text" onPress={() => setDismissed(true)}>
            Dismiss
          </Button>
        </View>
      </Collapsible>
    </AnimatedSurface>
  );
}

const stylesheet = createStyles(({ colors, corner }) => ({
  surface: {
    marginHorizontal: 16,
    backgroundColor: colors.primaryContainer,
    borderRadius: corner.m,
    overflow: 'hidden',
  },
  text: {
    color: colors.onPrimaryContainer,
  },
  overview: (expanded: boolean) => ({
    paddingTop: 16,
    paddingBottom: expanded ? 8 : 16,
    paddingLeft: 16,
    paddingRight: 24,
  }),
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  title: {
    flex: 1,
  },
  progress: {
    color: colors.primary,
    backgroundColor: colors.surface,
  },
  actions: {
    alignItems: 'stretch',
    marginBottom: 8,
  },
}));

export const GettingStarted = withSuspense(memo(GettingStarted_));
