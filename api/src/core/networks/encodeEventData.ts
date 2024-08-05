import { ExtractAbiEvent, ExtractAbiEvents } from 'abitype';
import {
  Abi,
  AbiEventNotFoundError,
  AbiEventParametersToPrimitiveTypes,
  ContractEventName,
  encodeAbiParameters,
  encodeEventTopics,
  EncodeEventTopicsErrorType,
  getAbiItem,
  Hex,
} from 'viem';
import { IsNarrowable, UnionEvaluate } from 'viem/_types/types/utils';

const docsPath = '/docs/contract/encodeEventTopics';

export type EncodeEventDataErrorType = EncodeEventTopicsErrorType;

type ContractEventArgs<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> = ContractEventName<abi>,
> =
  AbiEventParametersToPrimitiveTypes<
    ExtractAbiEvent<abi extends Abi ? abi : Abi, eventName>['inputs'],
    { IndexedOnly: false }
  > extends infer args
    ? [args] extends [never]
      ? readonly unknown[] | Record<string, unknown>
      : args
    : readonly unknown[] | Record<string, unknown>;

export type EncodeEventDataParameters<
  abi extends Abi | readonly unknown[] = Abi,
  eventName extends ContractEventName<abi> | undefined = ContractEventName<abi>,
  ///
  hasEvents = abi extends Abi
    ? Abi extends abi
      ? true
      : [ExtractAbiEvents<abi>] extends [never]
        ? false
        : true
    : true,
  allArgs = ContractEventArgs<
    abi,
    eventName extends ContractEventName<abi> ? eventName : ContractEventName<abi>
  >,
  allErrorNames = ContractEventName<abi>,
> = {
  abi: abi;
  args?: allArgs | undefined;
} & UnionEvaluate<
  IsNarrowable<abi, Abi> extends true
    ? abi['length'] extends 1
      ? { eventName?: eventName | allErrorNames | undefined }
      : { eventName: eventName | allErrorNames }
    : { eventName?: eventName | allErrorNames | undefined }
> &
  (hasEvents extends true ? unknown : never);

export function encodeEventData<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
>(parameters: EncodeEventDataParameters<abi, eventName>): Hex {
  const { abi, eventName, args } = parameters as EncodeEventDataParameters;

  let abiItem = abi[0];
  if (eventName) {
    const item = getAbiItem({ abi, name: eventName });
    if (!item) throw new AbiEventNotFoundError(eventName, { docsPath });
    abiItem = item;
  }

  if (abiItem.type !== 'event') throw new AbiEventNotFoundError(undefined, { docsPath });
  if (!(args && 'inputs' in abiItem)) return '0x';

  const nonIndexedParams = abiItem.inputs?.filter(
    (param) => !('indexed' in param && param.indexed),
  );

  const nonIndexedArgs = Array.isArray(args)
    ? args
    : Object.entries(args)
        .filter(([aName]) => nonIndexedParams.find((v) => v.name === aName))
        .sort(
          ([aName], [bName]) =>
            nonIndexedParams.findIndex((v) => v.name === aName) -
            nonIndexedParams.findIndex((v) => v.name === bName),
        )
        .map(([, v]) => v);

  return encodeAbiParameters(nonIndexedParams, nonIndexedArgs);
}

export function encodeEventTopicsAndData<
  const abi extends Abi | readonly unknown[],
  eventName extends ContractEventName<abi> | undefined = undefined,
>(parameters: EncodeEventDataParameters<abi, eventName>) {
  return {
    topics: encodeEventTopics(parameters),
    data: encodeEventData(parameters),
  };
}
