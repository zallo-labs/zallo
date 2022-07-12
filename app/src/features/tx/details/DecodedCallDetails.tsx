import { ExpandableText } from '@components/ExpandableText';
import { LineSkeleton } from '@components/skeleton/LineSkeleton';
import { withSkeleton } from '@components/skeleton/withSkeleton';
import { FormatTypes } from 'ethers/lib/utils';
import { Call } from 'lib';
import { Caption, Paragraph } from 'react-native-paper';
import { useContractMethod } from '~/queries/useContractMethod';
import { CallDetailsRow } from './CallDetailsRow';

export interface DecodedOpDetailsProps {
  call: Call;
}

export const DecodedOpDetails = withSkeleton(
  ({ call: { to, data } }: DecodedOpDetailsProps) => {
    const { methodFragment, methodInterface } = useContractMethod(to, data);

    if (!methodFragment || !methodInterface) return null;

    const decoded = methodInterface.decodeFunctionData(methodFragment, data);

    return (
      <>
        <Caption>Method</Caption>
        <Paragraph>
          {methodFragment.format(FormatTypes.full).slice(9)}
        </Paragraph>

        {methodFragment.inputs.map((input, i) => (
          <CallDetailsRow
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
