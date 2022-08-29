import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { ExpandableText } from '~/components/ExpandableText';
import { getMethodInputs } from './getMethodInputs';
import { hexDataLength, hexlify } from 'ethers/lib/utils';
import { Call, REMOVE_WALLET_SIGHASH } from 'lib';
import { Text } from 'react-native-paper';
import {
  UPSERT_WALLET_SIGHSAH,
  useContractMethod,
} from '~/queries/useContractMethod.api';
import { MethodInputRow } from './MethodInputRow';
import { memo } from 'react';
import { UpsertWalletMethod } from './wallet/UpsertWalletMethod';
import { useCallName } from '~/components/call/useCallName';
import { RemoveWalletMethod } from './wallet/RemoveWalletMethod';

export interface DetailedCallMethodProps {
  call: Call;
}

export const DetailedCallMethod = memo(({ call }: DetailedCallMethodProps) => {
  const method = useContractMethod(call);
  const name = useCallName(call);

  if (hexDataLength(call.data) === 0) return null;

  if (!method)
    return (
      <Box>
        <Box horizontal justifyContent="space-between" alignItems="baseline">
          <Text variant="titleMedium">Data</Text>
          <Box ml={2}>
            <Text variant="bodyMedium">Failed to decode</Text>
          </Box>
        </Box>

        <ExpandableText value={hexlify(call.data)} beginLen={18}>
          {({ value }) => <Text variant="bodySmall">{value}</Text>}
        </ExpandableText>
      </Box>
    );

  if (method.sighash === UPSERT_WALLET_SIGHSAH)
    return <UpsertWalletMethod call={call} />;

  if (method.sighash === REMOVE_WALLET_SIGHASH)
    return <RemoveWalletMethod call={call} />;

  return (
    <Accordion title={<Text variant="titleMedium">{name}</Text>}>
      <Box mt={1}>
        {getMethodInputs(method, call.data).map((input) => (
          <Box key={input.param.format()} ml={2} mb={1}>
            <MethodInputRow key={input.param.format()} {...input} />
          </Box>
        ))}
      </Box>
    </Accordion>
  );
});
