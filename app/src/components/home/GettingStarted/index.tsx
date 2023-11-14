import { FragmentType, gql, useFragment } from '@api';
import { StyleProp, ViewStyle } from 'react-native';
import { useLinkGoogleSuggestion } from './useLinkGoogleSuggestion';
import { useLinkDeviceSuggestion } from './useLinkDeviceSuggestion';
import { useLinkAppleSuggestion } from './useLinkAppleSuggestion';
import { CheckIcon } from '@theme/icons';
import { useTransferSuggestion } from './useTransferSuggestion';
import { useDepositSuggestion } from './useDepositSuggestion';
import { useAtom } from 'jotai';
import { persistedAtom } from '~/lib/persistedAtom';
import { ReactNode } from 'react';
import { useCreatePolicySuggestion } from '~/components/home/GettingStarted/useCreatePolicySuggestion';
import { createStyles, useStyles } from '@theme/styles';
import { View } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { ProgressBar, Surface, Text, TouchableRipple } from 'react-native-paper';
import Animated, { FadeIn, SlideOutRight } from 'react-native-reanimated';
import { Button } from '~/components/Button';
import { Chevron } from '~/components/Chevron';
import { FormattedNumber } from '~/components/format/FormattedNumber';
import { useToggle } from '~/hooks/useToggle';

const Query = gql(/* GraphQL */ `
  fragment GettingStarted_Query on Query @argumentDefinitions(account: { type: "Address!" }) {
    ...useDepositSuggestion_Query @arguments(account: $account)
    ...useTransferSuggestion_Query @arguments(account: $account)
  }
`);

const User = gql(/* GraphQL */ `
  fragment GettingStarted_User on User {
    id
    ...useLinkDeviceSuggestion_User
    ...useLinkGoogleSuggestion_User
    ...useLinkAppleSuggestion_User
  }
`);

const Account = gql(/* GraphQL */ `
  fragment GettingStarted_Account on Account {
    id
    ...useCreatePolicySuggestion_Account
    ...useTransferSuggestion_Account
  }
`);

const dismissedAtom = persistedAtom<boolean>('gettingStartedDismissed', false);

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

export interface GettingStartedProps {
  query: FragmentType<typeof Query>;
  user: FragmentType<typeof User>;
  account: FragmentType<typeof Account>;
  style?: StyleProp<ViewStyle>;
  then?: ReactNode;
}

export function GettingStarted({ style, then, ...props }: GettingStartedProps) {
  const { styles } = useStyles(stylesheet);
  const query = useFragment(Query, props.query);
  const user = useFragment(User, props.user);
  const account = useFragment(Account, props.account);

  const [dismissed, setDismissed] = useAtom(dismissedAtom);
  const [expanded, toggleExpanded] = useToggle(true);

  const suggestions = [
    useLinkGoogleSuggestion({ user }),
    useLinkAppleSuggestion({ user }),
    useLinkDeviceSuggestion({ user }),
    useDepositSuggestion({ query }),
    useCreatePolicySuggestion({ account }),
    useTransferSuggestion({ query, account }),
  ].filter(Boolean);

  const complete = suggestions.filter((s) => s.complete);
  const progress = complete.length / suggestions.length;

  if (progress === 1 || dismissed) return then;

  return (
    <AnimatedSurface style={[styles.surface, style]} entering={FadeIn} exiting={SlideOutRight}>
      <TouchableRipple style={styles.overview(expanded)} onPress={toggleExpanded}>
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
