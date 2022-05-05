import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import { Box } from '@components/Box';
import { useIsDeployed } from '@features/safe/useIsDeployed';
import { useDeploySafe } from '@features/safe/useDeploySafe';
import { HomeScreenProps } from '../HomeScreen';
import { HomeActionButton } from './HomeActionButton';

export const HomeActions = () => {
  const navigation = useNavigation<HomeScreenProps['navigation']>();
  const isDeployed = useIsDeployed();
  const deploySafe = useDeploySafe();

  const deployRequiredDisabled = (label: string) =>
    !isDeployed && `Safe must be deployed to ${label}`;

  return (
    <Box horizontal>
      <HomeActionButton
        label="SEND"
        icon={(props) => <MaterialCommunityIcons name="arrow-up" {...props} />}
        onClick={() => {
          // TODO:
        }}
        disabled={deployRequiredDisabled('send')}
      />

      <HomeActionButton
        label="RECEIVE"
        icon={(props) => (
          <MaterialCommunityIcons name="arrow-down" {...props} />
        )}
        onClick={() => navigation.navigate('Receive')}
      />

      {!isDeployed && (
        <HomeActionButton
          label="DEPLOY"
          icon={(props) => (
            <MaterialCommunityIcons name="rocket-launch" {...props} />
          )}
          // onClick={() => console.log('clicked deploy safe')}
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
