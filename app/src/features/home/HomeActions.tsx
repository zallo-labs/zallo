import { Pressable } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { Box } from '@components/Box';
import { useNavigation } from '@react-navigation/native';
import { HomeScreenProps } from './HomeScreen';

export const HomeActions = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<HomeScreenProps['navigation']>();

  return (
    <Box horizontal>
      <Pressable onPress={() => navigation.navigate('Receive')}>
        <Box vertical center>
          <MaterialCommunityIcons name="arrow-down" size={30} color={colors.primary} />

          <Box mt={1}>
            <Text style={{ color: colors.primary }}>RECEIVE</Text>
          </Box>
        </Box>
      </Pressable>
    </Box>
  );
};
