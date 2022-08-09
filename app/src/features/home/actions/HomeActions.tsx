import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Box } from '@components/Box';
import { useDeployAccount } from '@features/account/useDeployAccount';
import { HomeScreenProps } from '../HomeScreen';
import { HomeActionButton } from './HomeActionButton';
import { useNavigateToSend } from '@features/send/SendScreen';
import { ReceiveIcon, SendIcon } from '@util/theme/icons';
import { usePropose } from '@features/execute/ProposeProvider';
import { useAccount } from '@features/account/AccountProvider';
import { ACCOUNT_IMPL } from '~/provider';
import { createUpgradeToTx } from 'lib';

export const HomeActions = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const deploy = useDeployAccount();
  const navigateToSend = useNavigateToSend();
  const { contract: account, impl } = useAccount();
  const propose = usePropose();

  const updateAvailable = ACCOUNT_IMPL !== impl;

  return (
    <Box horizontal>
      <HomeActionButton label="SEND" icon={SendIcon} onClick={navigateToSend} />

      <HomeActionButton
        label="RECEIVE"
        icon={ReceiveIcon}
        onClick={() => navigation.navigate('Receive')}
      />

      <HomeActionButton
        label="SWAP"
        icon={(props) => <AntDesign name="swap" {...props} />}
        onClick={() => {
          // TODO:
        }}
      />

      {deploy ? (
        <HomeActionButton
          label="DEPLOY"
          icon={(props) => (
            <MaterialCommunityIcons name="rocket-launch" {...props} />
          )}
          onClick={deploy}
        />
      ) : (
        updateAvailable && (
          <HomeActionButton
            label="Update"
            icon={(props) => (
              <MaterialCommunityIcons name="refresh" {...props} />
            )}
            onClick={() => propose(createUpgradeToTx(account, ACCOUNT_IMPL))}
          />
        )
      )}
    </Box>
  );
};
