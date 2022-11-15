import { EditIcon, ShareIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { useTheme } from '@theme/paper';
import { useEffect, useMemo, useState } from 'react';
import { Share } from 'react-native';
import { Appbar, Menu, Provider, Text } from 'react-native-paper';
import { AppbarBack } from '~/components/Appbar/AppbarBack';
import { AppbarMore } from '~/components/Appbar/AppbarMore';
import { ExpandableText } from '~/components/ExpandableText';
import { TextField } from '~/components/fields/TextField';
import { Box } from '~/components/layout/Box';
import { useSetDeviceName } from '~/mutations/useSetDeviceName.api';
import { RootNavigatorScreenProps } from '~/navigation/RootNavigator';
import { hideSnackbar, showInfo } from '~/provider/SnackbarProvider';
import { useDeviceMeta } from '~/queries/useDeviceMeta.api';
import { buildAddrLink } from '~/util/addrLink';
import { QrCode } from '../receive/QrCode';

export type DeviceScreenProps = RootNavigatorScreenProps<'Device'>;

export const DeviceScreen = (_props: DeviceScreenProps) => {
  const styles = useStyles();
  const { address, name } = useDeviceMeta();
  const setDeviceName = useSetDeviceName();

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(name);

  const save = () => {
    setEditingName(false);
    setDeviceName(nameValue);
  };

  useEffect(() => {
    showInfo('Scan from an authorized device to gain account access', { autoHide: false });
    return () => hideSnackbar();
  }, []);

  const url = useMemo(() => buildAddrLink({ target_address: address }), [address]);

  return (
    <Provider theme={useTheme()}>
      <Box flex={1}>
        <Appbar.Header mode="small">
          <AppbarBack />
          <Appbar.Content title="" />

          <Appbar.Action
            icon={ShareIcon}
            onPress={() =>
              Share.share({
                title: 'Device',
                message: `${name}\n${url}`,
                url,
              })
            }
          />

          <AppbarMore>
            {({ close }) => (
              <Menu.Item
                leadingIcon={EditIcon}
                title="Rename device"
                onPress={() => {
                  close();
                  setEditingName(true);
                }}
              />
            )}
          </AppbarMore>
        </Appbar.Header>

        <Box alignItems="center" mx={4}>
          {editingName ? (
            <Box horizontal>
              <TextField
                label="Name"
                value={nameValue}
                onChangeText={setNameValue}
                containerStyle={[styles.field, styles.name]}
                onSubmitEditing={save}
                onBlur={save}
              />
            </Box>
          ) : (
            <Text variant="displaySmall" style={[styles.text, styles.name]}>
              {name}
            </Text>
          )}

          <QrCode value={url} />

          <ExpandableText beginLen={6} endLen={4} value={address}>
            {({ value }) => (
              <Text variant="titleLarge" style={[styles.text, styles.address]}>
                {value}
              </Text>
            )}
          </ExpandableText>
        </Box>
      </Box>
    </Provider>
  );
};

const useStyles = makeStyles(({ space }) => ({
  text: {
    textAlign: 'center',
  },
  field: {
    flex: 1,
  },
  name: {
    marginTop: space(2),
    marginBottom: space(4),
  },
  address: {
    marginTop: space(4),
  },
}));
