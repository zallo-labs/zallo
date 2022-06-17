import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { ExpandableText } from '@components/ExpandableText';
import { TokenValue } from '@components/token/TokenValue';
import { hexlify } from 'ethers/lib/utils';
import { Op } from 'lib';
import { Paragraph, Subheading } from 'react-native-paper';
import { ETH } from '~/token/tokens';
import { useToken } from '~/token/useToken';
import { DecodedOpDetails } from './DecodedOpDetails';
import { OpDetailsRow } from './OpDetailsRow';

export interface OpDetailsProps {
  op: Op;
  title?: string;
}

export const OpDetails = ({ op, title }: OpDetailsProps) => {
  const token = useToken(op.to) ?? ETH;

  return (
    <Box vertical>
      {title && <Subheading style={{ fontWeight: 'bold' }}>{title}</Subheading>}

      <OpDetailsRow
        title="to"
        content={
          <Paragraph>
            <Addr addr={op.to} />
          </Paragraph>
        }
      />

      <OpDetailsRow
        title="value"
        content={
          <Paragraph>
            <TokenValue token={token} value={op.value} />
          </Paragraph>
        }
      />

      <OpDetailsRow
        title="data"
        content={
          <ExpandableText text={hexlify(op.data)} beginLen={8} endLen={8}>
            {({ text }) => <Paragraph>{text}</Paragraph>}
          </ExpandableText>
        }
      />

      <OpDetailsRow
        title="nonce"
        content={<Paragraph>{op.nonce.toString()}</Paragraph>}
      />

      <DecodedOpDetails op={op} />
    </Box>
  );
};
