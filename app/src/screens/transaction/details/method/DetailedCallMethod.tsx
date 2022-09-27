import { Accordion } from '~/components/Accordion';
import { Box } from '~/components/layout/Box';
import { ExpandableText } from '~/components/ExpandableText';
import { getMethodInputs } from './getMethodInputs';
import { hexDataLength, hexlify } from 'ethers/lib/utils';
import { Call, REMOVE_USER_SIGHASH } from 'lib';
import { Text } from 'react-native-paper';
import {
  UPSERT_USER_SIGHSAH,
  useContractMethod,
} from '~/queries/useContractMethod.api';
import { MethodInputRow } from './MethodInputRow';
import { memo } from 'react';
import { UpsertUserMethod } from './user/UpsertUserMethod';
import { RemoveUserMethod } from './user/RemoveUserMethod';
import { StyleProp, ViewStyle } from 'react-native';
import { ERC20_TRANSFER_SIGHASH } from '~/components/call/useDecodedTransfer';
import { useCallLabel } from '~/components/call/useCallLabel';

export interface DetailedCallMethodProps {
  call: Call;
  style?: StyleProp<ViewStyle>;
}

export const DetailedCallMethod = memo(
  ({ call, style }: DetailedCallMethodProps) => {
    const [method] = useContractMethod(call);
    const label = useCallLabel(call);

    if (hexDataLength(call.data) === 0) return null;

    if (!method)
      return (
        <Box style={style}>
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

    // Transfer details are shown for every transaction; no need to duplicate them
    if (method.sighash === ERC20_TRANSFER_SIGHASH) return null;

    if (method.sighash === UPSERT_USER_SIGHSAH)
      return <UpsertUserMethod call={call} style={style} />;

    if (method.sighash === REMOVE_USER_SIGHASH)
      return <RemoveUserMethod call={call} style={style} />;

    return (
      <Accordion
        title={
          <Text variant="titleMedium" style={style}>
            {label}
          </Text>
        }
      >
        {getMethodInputs(method, call.data).map((input) => (
          <Box key={input.param.format()} ml={2} mb={1}>
            <MethodInputRow key={input.param.format()} {...input} />
          </Box>
        ))}
      </Accordion>
    );
  },
);
