import { DialogActions } from '#/Dialog/DialogActions';
import { DialogModal } from '#/Dialog/DialogModal';
import { ListItem, ListItemProps } from '#/list/ListItem';
import { Portal } from '@gorhom/portal';
import { ExternalLinkIcon, UpdateIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Link } from 'expo-router';
import { PolicyKey, UAddress } from 'lib';
import { useState } from 'react';
import { View } from 'react-native';
import { Button, Checkbox, Dialog, Text } from 'react-native-paper';
import { useRemovePolicy } from '~/hooks/mutations/useRemovePolicy';
import { CONFIG } from '~/util/config';

const UPGRADE_POLICY_HREF = CONFIG.docsUrl + '/upgrades';

export interface UpgradePolicyItemProps extends Partial<ListItemProps> {
  account: UAddress;
  policyKey: PolicyKey;
}

export function UpgradePolicyItem({ account, policyKey, ...props }: UpgradePolicyItemProps) {
  const { styles } = useStyles(stylesheet);
  const remove = useRemovePolicy();

  const [showDialog, setShowDialog] = useState(false);
  const [risksAccepted, setRisksAccepted] = useState(false);

  return (
    <>
      <Link asChild href={UPGRADE_POLICY_HREF}>
        <ListItem
          leading={UpdateIcon}
          headline="Automatic upgrades"
          supporting="Enabled"
          trailing={ExternalLinkIcon}
          onLongPress={async () => {
            setShowDialog(true);
          }}
          {...props}
        />
      </Link>

      {showDialog && (
        <Portal>
          <DialogModal>
            <Dialog.Title>Automatic upgrades</Dialog.Title>

            <Dialog.Content>
              <Text variant="bodyMedium">
                Opting-out of the upgrade policy is{' '}
                <Text variant="titleSmall">not recommended</Text> and may lead to compatibility
                issues with the Zallo app
              </Text>

              <View style={styles.checkboxContainer}>
                <Checkbox
                  status={risksAccepted ? 'checked' : 'unchecked'}
                  onPress={() => setRisksAccepted((c) => !c)}
                />

                <Text variant="titleSmall">
                  I have read and understand the implications of opting out of the{' '}
                  <Link href={UPGRADE_POLICY_HREF} style={styles.link}>
                    Upgrade Policy
                  </Link>
                </Text>
              </View>
            </Dialog.Content>

            <DialogActions>
              <Button textColor={styles.cancel.color} onPress={() => setShowDialog(false)}>
                Cancel
              </Button>

              <Button
                textColor={styles.destructive.color}
                disabled={!risksAccepted}
                onPress={async () => {
                  setShowDialog(false);
                  await remove(account, policyKey);
                }}
              >
                Opt-out of automatic upgrades
              </Button>
            </DialogActions>
          </DialogModal>
        </Portal>
      )}
    </>
  );
}

const stylesheet = createStyles(({ colors }) => ({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    // marginVertical: 8,
    marginTop: 16,
  },
  link: {
    color: colors.tertiary,
  },
  cancel: {
    color: colors.onSurfaceVariant,
  },
  destructive: {
    color: colors.error,
  },
}));
