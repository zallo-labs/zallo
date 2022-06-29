import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Box } from '@components/Box';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import { useDeploySafe } from '@features/safe/useDeploySafe';
import { HomeScreenProps } from '../HomeScreen';
import { HomeActionButton } from './HomeActionButton';
import { useNavigateToSend } from '@features/send/SendScreen';
import { ReceiveIcon, SendIcon } from '@util/icons';

export const HomeActions = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const isDeployed = useIsDeployed();
  const deploySafe = useDeploySafe();
  const navigateToSend = useNavigateToSend();

  const deployRequiredDisabled = (label: string) =>
    !isDeployed && `Safe must be deployed to ${label}`;

  return (
    <Box horizontal>
      <HomeActionButton
        label="SEND"
        icon={SendIcon}
        onClick={navigateToSend}
        disabled={deployRequiredDisabled('send')}
      />

      <HomeActionButton
        label="RECEIVE"
        icon={ReceiveIcon}
        onClick={() => navigation.navigate('Receive')}
      />

      {!isDeployed && (
        <HomeActionButton
          label="DEPLOY"
          icon={(props) => (
            <MaterialCommunityIcons name="rocket-launch" {...props} />
          )}
          onClick={deploySafe}
        />
      )}

      <HomeActionButton
        label="SWAP"
        icon={(props) => <AntDesign name="swap" {...props} />}
        onClick={() => {
          // TODO:
        }}
        disabled={deployRequiredDisabled('swap')}
      />
    </Box>
  );
};
