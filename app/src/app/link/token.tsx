import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Text } from 'react-native-paper';
import { Subject } from 'rxjs';
import { useMutation } from 'urql';
import { z } from 'zod';

import { Button } from '~/components/Button';
import { showSuccess } from '~/components/provider/SnackbarProvider';
import { Sheet } from '~/components/sheet/Sheet';
import { gql } from '~/gql/api/generated';
import { ConfirmLinkSheet_LinkMutation } from '~/gql/api/generated/graphql';
import { useLocalParams } from '~/hooks/useLocalParams';
import { materialCommunityIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

export const LINKINGS_FROM_DEVICE = new Subject<ConfirmLinkSheet_LinkMutation>();

const Link = gql(/* GraphQL */ `
  mutation ConfirmLinkSheet_Link($token: String!) {
    link(input: { token: $token }) {
      id
      approvers {
        id
      }
    }
  }
`);

export const LinkIcon = materialCommunityIcon('link-variant');

const LinkWithTokenSheetParams = z.object({ token: z.string() });
export type LinkWithTokenSheetParams = z.infer<typeof LinkWithTokenSheetParams>;

export default function LinkWithTokenSheet() {
  const { token } = useLocalParams(LinkWithTokenSheetParams);
  const { styles } = useStyles(stylesheet);
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

const stylesheet = createStyles(({ colors, iconSize }) => ({
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
