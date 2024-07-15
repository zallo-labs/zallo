import { OutboundIcon, SwapIcon, ScanIcon, ReceiveIcon } from '@theme/icons';
import { ScrollView, View } from 'react-native';
import { UAddress } from 'lib';
import { Link } from 'expo-router';
import { useSend } from '~/hooks/useSend';
import { CORNER } from '@theme/paper';
import { createStyles, useStyles } from '@theme/styles';
import { Button } from '#/Button';

export interface QuickActionsProps {
  account: UAddress;
}

export function QuickActions({ account }: QuickActionsProps) {
  const { styles } = useStyles(stylesheet);
  const send = useSend();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Button
          mode="contained"
          icon={OutboundIcon}
          onPress={() => {
            send({ account });
          }}
        >
          Send
        </Button>

        <Link asChild href={{ pathname: `/(nav)/[account]/swap`, params: { account } }}>
          <Button mode="contained-tonal" icon={SwapIcon}>
            Swap
          </Button>
        </Link>

        <Link asChild href={{ pathname: '/scan', params: { account } }}>
          <Button mode="contained-tonal" icon={ScanIcon}>
            Scan
          </Button>
        </Link>

        <Link asChild href={{ pathname: `/(modal)/[account]/receive`, params: { account } }}>
          <Button mode="contained-tonal" icon={ReceiveIcon}>
            Receive
          </Button>
        </Link>
      </ScrollView>
    </View>
  );
}

const stylesheet = createStyles(({ colors, negativeMargin }) => ({
  container: {
    marginHorizontal: negativeMargin,
  },
  content: {
    flexGrow: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  action: {
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: CORNER.l,
  },
  iconContainer: {
    backgroundColor: colors.secondaryContainer,
  },
  icon: {
    color: colors.onSecondaryContainer,
  },
}));
