import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Box } from '@components/Box';
import { useDeploySafe } from '@features/safe/useDeploySafe';
import { HomeScreenProps } from '../HomeScreen';
import { HomeActionButton } from './HomeActionButton';
import { useNavigateToSend } from '@features/send/SendScreen';
import { ReceiveIcon, SendIcon } from '@util/icons';

export const HomeActions = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const deploy = useDeploySafe();
  const navigateToSend = useNavigateToSend();

  return (
    <Box horizontal>
      <HomeActionButton label="SEND" icon={SendIcon} onClick={navigateToSend} />

      <HomeActionButton
        label="RECEIVE"
        icon={ReceiveIcon}
        onClick={() => navigation.navigate('Receive')}
      />

      {deploy && (
        <HomeActionButton
          label="DEPLOY"
          icon={(props) => (
            <MaterialCommunityIcons name="rocket-launch" {...props} />
          )}
          onClick={deploy}
        />
      )}

      <HomeActionButton
        label="SWAP"
        icon={(props) => <AntDesign name="swap" {...props} />}
        onClick={() => {
          // TODO:
        }}
      />
    </Box>
  );
};
