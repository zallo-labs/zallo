import { ExpandableText } from '@components/ExpandableText';
import { FormatTypes } from 'ethers/lib/utils';
import { Op } from 'lib';
import { Caption, Paragraph } from 'react-native-paper';
import { useContractMethod } from '~/queries/useContractMethod';
import { OpDetailsRow } from './OpDetailsRow';

export interface DecodedOpDetailsProps {
  op: Op;
}

export const DecodedOpDetails = ({ op }: DecodedOpDetailsProps) => {
  const { methodFragment, methodInterface } = useContractMethod(op.to, op.data);

  console.log(methodFragment);

  if (!methodFragment || !methodInterface) return null;

  const decoded = methodInterface.decodeFunctionData(methodFragment, op.data);
  console.log(decoded);

  return (
    <>
      <Caption>Method</Caption>
      <Paragraph>{methodFragment.format(FormatTypes.full).slice(9)}</Paragraph>

      {methodFragment.inputs.map((input, i) => (
        <OpDetailsRow
          key={input.name}
          title={input.name}
          content={
            <ExpandableText text={decoded[i].toString()} beginLen={10} endLen={10}>
              {({ text }) => <Paragraph>{text}</Paragraph>}
            </ExpandableText>
          }
        />
      ))}
    </>
  );
};
