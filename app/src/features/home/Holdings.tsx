import { TokenItem } from '@features/token/TokenItem';
import { TOKENS } from '@features/token/tokens';
import { Box } from '@components/Box';
import { useTheme } from 'react-native-paper';
import { Divider } from '@components/Divider';

const space = 3;

export const Holdings = () => {
  const theme = useTheme();

  return (
    <Box
      surface={{
        borderTopLeftRadius: theme.radius,
        borderTopRightRadius: theme.radius,
      }}
    >
      {TOKENS.map((token, i) => (
        <Box key={token.addr} mt={i > 0 ? space : 0}>
          <TokenItem token={token} />
          
          {i < TOKENS.length - 1 && (
            <Box mt={space}>
              <Divider />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};
