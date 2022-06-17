import { ExpandableText } from '@components/ExpandableText';
import { LineSkeleton } from '@components/skeleton/LineSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { FormatTypes } from 'ethers/lib/utils';
import { Op } from 'lib';
import { Caption, Paragraph } from 'react-native-paper';
import { useContractMethod } from '~/queries/useContractMethod';
import { OpDetailsRow } from './OpDetailsRow';

export interface DecodedOpDetailsProps {
  op: Op;
}

export const DecodedOpDetails = withSkeleton(
  ({ op }: DecodedOpDetailsProps) => {
    const { methodFragment, methodInterface } = useContractMethod(
      op.to,
      op.data,
    );

    if (!methodFragment || !methodInterface) return null;

    const decoded = methodInterface.decodeFunctionData(methodFragment, op.data);

    return (
      <>
        <Caption>Method</Caption>
        <Paragraph>
          {methodFragment.format(FormatTypes.full).slice(9)}
        </Paragraph>

        {methodFragment.inputs.map((input, i) => (
          <OpDetailsRow
            key={input.name}
            title={input.name}
            content={
              <ExpandableText
                text={decoded[i].toString()}
                beginLen={10}
                endLen={10}
              >
                {({ text }) => <Paragraph>{text}</Paragraph>}
              </ExpandableText>
            }
          />
        ))}
      </>
    );
  },
  LineSkeleton,
);
