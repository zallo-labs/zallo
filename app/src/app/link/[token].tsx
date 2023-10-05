import { SearchParams, useLocalSearchParams, useRouter } from 'expo-router';
import { Sheet } from '~/components/sheet/Sheet';
import { materialCommunityIcon } from '@theme/icons';
import { View } from 'react-native';
import { makeStyles } from '@theme/makeStyles';
import { Text } from 'react-native-paper';
import { Button } from '~/components/Button';
import { gql } from '@api/generated';
import { showSuccess } from '~/provider/SnackbarProvider';
import { useMutation } from 'urql';
import { Subject } from 'rxjs';
import { ConfirmLinkSheet_LinkMutation } from '@api/generated/graphql';

export const LINKINGS_FROM_DEVICE = new Subject<ConfirmLinkSheet_LinkMutation>();

const Link = gql(/* GraphQL */ `
  mutation ConfirmLinkSheet_Link($token: String!) {
    link(input: { token: $token }) {
      id
      name
      approvers {
        id
      }
    }
  }
`);

export const LinkIcon = materialCommunityIcon('link-variant');

export type LinkWithTokenSheetRoute = `/link/[token]`;
export type LinkWithTokenSheetParams = SearchParams<LinkWithTokenSheetRoute>;

export default function LinkWithTokenSheet() {
  const { token } = useLocalSearchParams<LinkWithTokenSheetParams>();
  const styles = useStyles();
  const { back } = useRouter();

  const link = useMutation(Link)[1];

  return (
    <Sheet onClose={back} handle={false}>
      <View style={styles.infoContainer}>
        <LinkIcon style={styles.icon} />

        <Text variant="titleLarge" style={styles.text}>
          Are you sure you want to link these users?
        </Text>

        <View>
          <Text variant="titleMedium" style={styles.text}>
            Only link with your own device
          </Text>

          <Text variant="bodyLarge" style={styles.text}>
            The device will be added to your user, and will be able to do anything on your behalf
            except approve proposals
          </Text>
        </View>

        <Button
          mode="contained"
          icon={LinkIcon}
          style={styles.button}
          onPress={async () => {
            const r = await link({ token });
            if (r.data) LINKINGS_FROM_DEVICE.next(r.data);
            showSuccess('Linked');
            back();
          }}
        >
          Link
        </Button>
      </View>
    </Sheet>
  );
}

const useStyles = makeStyles(({ colors, iconSize }) => ({
  infoContainer: {
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
    gap: 16,
  },
  icon: {
    color: colors.onSurface,
    fontSize: iconSize.large,
  },
  text: {
    textAlign: 'center',
  },
  button: {
    backgroundColor: colors.tertiary,
    alignSelf: 'stretch',
  },
}));
