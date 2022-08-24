import { buildAddrLink } from '~/util/addrLink';
import { ShareIcon } from '~/util/theme/icons';
import { makeStyles } from '~/util/theme/makeStyles';
import { Address } from 'lib';
import { FC } from 'react';
import { Share } from 'react-native';
import { Appbar, Text } from 'react-native-paper';
import { AppbarCenterContent } from '~/components/Appbar/AppbarCenterContent';
import { AppbarHeaderProps } from '~/components/Appbar/useAppbarHeader';
import { useGoBack } from '~/components/Appbar/useGoBack';
import { useIsDeployed } from '@network/useIsDeployed';

export interface AccountAppbarProps {
  AppbarHeader: FC<AppbarHeaderProps>;
  title?: string;
  account: Address;
}

export const AccountAppbar = ({
  AppbarHeader,
  title,
  account,
}: AccountAppbarProps) => {
  const styles = useStyles();
  const isDeployed = useIsDeployed(account);

  return (
    <AppbarHeader mode="medium">
      <Appbar.BackAction onPress={useGoBack()} />

      {!isDeployed && (
        <AppbarCenterContent>
          <Text style={styles.inactive}>Inactive</Text>
        </AppbarCenterContent>
      )}

      <Appbar.Content title={title || 'Account'} />

      <Appbar.Action
        icon={ShareIcon}
        onPress={() => {
          const url = buildAddrLink({ target_address: account });
          Share.share({ url, message: url });
        }}
      />
    </AppbarHeader>
  );
};

const useStyles = makeStyles(({ colors }) => ({
  inactive: {
    color: colors.error,
  },
}));
