import {
  Abi,
  AbiParameterToPrimitiveType,
  Address,
  ContractErrorArgs,
  ContractEventArgs,
  ContractEventName,
  ContractFunctionRevertedError,
  GetEventArgs,
  TransactionExecutionErrorType,
  TransactionReceipt,
  decodeEventLog,
  isHex,
  zeroAddress,
} from 'viem';
import { network } from './network';
import { use } from 'chai';
import { buildAssert } from '@nomicfoundation/hardhat-chai-matchers/utils';
import { Hex, LogTopic, ContractErrorName } from 'viem';
import deepEqual from 'fast-deep-equal';
import TestToken from '../contracts/TestToken';
import { ExtractAbiError, ExtractAbiEvent, AbiParametersToPrimitiveTypes } from 'abitype';

use(viemChaiMatchers);

function viemChaiMatchers(chai: Chai.ChaiStatic, _utils: Chai.ChaiUtils) {
  const Assertion = chai.Assertion;

  Assertion.addProperty('succeed', function (this) {
    return asyncAssertion(this, async ({ subject, assert }) => {
      try {
        // sendTransaction
        const receipt = await getReceipt(subject);

        assert(
          receipt?.status === 'success',
          'Expected to succeed, but reverted',
          'Expected to NOT succeed',
        );
      } catch (error) {
        // readContract
        assert(false, `Expected to succeed, but reverted with ${error}`, `Expected to NOT succeed`);
      }
    });
  });

  Assertion.addProperty('revert', function (this) {
    return asyncAssertion(this, async ({ subject, assert }) => {
      try {
        // sendTransaction
        const receipt = await getReceipt(subject);

        assert(receipt?.status === 'reverted', 'Expected to revert', 'Expected to NOT revert');
      } catch (error) {
        // readContract
      }
    });
  });

  Assertion.addMethod('revertWith', function (this, { errorName, args }: RevertWithParams) {
    return asyncAssertion(this, async ({ subject, assert }) => {
      try {
        // sendTransaction
        await getReceipt(subject);

        assert(
          false,
          'Expected transaction to revert with error before resolving receipt',
          'Expected transaction to NOT revert with error before resolving receipt',
        );
      } catch (error) {
        // readContract
        const { cause } = error as TransactionExecutionErrorType;

        if (cause instanceof ContractFunctionRevertedError) {
          const data = cause.data;
          assert(
            data?.errorName === errorName,
            `Expected errorName to be "${errorName}" but found "${data?.errorName}"`,
            `Expected errorName to NOT be "${errorName}" but found "${data?.errorName}"`,
          );
          if (args) {
            assert(
              deepEqual(data?.args, args),
              `Expected error args to be ${JSON.stringify(args)} but found ${JSON.stringify(args)}`,
              `Expected error args to NOT be ${JSON.stringify(args)}`,
            );
          }
        } else {
          assert(
            false,
            `Expected revert error cause to be a ContractFunctionRevertedError but got ${cause}`,
            `Expected revert error cause to NOT be a ContractFunctionRevertedError`,
          );
        }
      }
    });
  });

  Assertion.addMethod(
    'changeBalance',
    function (this, address: Address, token: Address, expectedChange: bigint) {
      return asyncAssertion(this, async ({ subject, assert }) => {
        const isEth = token === zeroAddress;
        const getBalance = () =>
          isEth
            ? network.getBalance({ address })
            : network.readContract({
                address: token,
                abi: TestToken.abi,
                functionName: 'balanceOf',
                args: [address],
              });

        const preBalance = await getBalance();
        const receipt = await getReceipt(subject);
        const postBalance = await getBalance();

        const gasBalanceChange =
          isEth && receipt?.from.toLowerCase() === address.toLowerCase()
            ? receipt.gasUsed * receipt.effectiveGasPrice
            : 0n;

        const change = postBalance - preBalance + gasBalanceChange;
        assert(
          change === expectedChange,
          `Expected "${address}" balance to change by ${expectedChange} but it changed by ${change}`,
          `Expected "${address}" balance to NOT change by ${change}`,
        );
      });
    },
  );

  Assertion.addMethod(
    'includeEvent',
    function (this, { abi, eventName, args }: IncludeEventParams) {
      return asyncAssertion(this, async ({ subject, assert }) => {
        const receipt = await getReceipt(subject);

        const foundWithMismatchingArgs: unknown[] = [];
        const found = receipt?.logs.some((log) => {
          try {
            const event = decodeEventLog({
              abi,
              eventName,
              topics: log.topics,
              data: log.data,
              strict: true,
            });

            if (event.eventName !== eventName) return false;

            if (args) {
              const equals = deepEqual(event.args, args);
              if (!equals) foundWithMismatchingArgs.push(event.args);
              return equals;
            }

            return true;
          } catch (_) {
            return false;
          }
        });

        if (!found && foundWithMismatchingArgs.length) {
          assert(
            false,
            `Expected transaction event "${eventName}" to have args ${JSON.stringify(
              args,
            )} but found ${foundWithMismatchingArgs.map((a) => JSON.stringify(a)).join(' & ')}`,
          );
        }

        assert(
          !!found,
          `Expected transaction to include event "${eventName}"`,
          `Expected transaction to NOT include event "${eventName}"`,
        );
      });
    },
  );

  // Assertion.addMethod('revertWith', function (input) {
  //   new Assertion(this._obj).to.eventually.be.rejected.and.be.an
  //     .instanceOf(TransactionExecutionError)
  //     .and.have.property(
  //       'details',
  //       // TODO  Does viem has a better way to extract the error string ?
  //       `VM Exception while processing transaction: reverted with reason string '${input}'`,
  //     );
  // });

  // Assertion.addMethod('includeEvent', function (abi: Abi, eventName: string) {
  //   const receipt: TransactionReceipt = this._obj;
  //   for (const log of receipt.logs) {
  //     try {
  //       const event = decodeEventLog({
  //         abi: abi,
  //         topics: log.topics,
  //         eventName: eventName,
  //         data: log.data,
  //       });
  //       if (event.eventName === eventName) {
  //         return new Assertion(event);
  //       }
  //     } catch {
  //       //
  //     }
  //   }
  //   throw new Error(`could not find any matching event for ${eventName}`);
  // });
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  export namespace Chai {
    interface Assertion {
      succeed: AsyncAssertion;
      revert: AsyncAssertion;
      revertWith<TAbi extends Abi, TErrorName extends ContractErrorName<TAbi>>(
        params: RevertWithParams<TAbi, TErrorName>,
      ): AsyncAssertion;
      changeBalance(address: Address, token: Address, change: bigint): AsyncAssertion;
      includeEvent<TAbi extends Abi, TEventName extends ContractEventName<TAbi>>(
        params: IncludeEventParams<TAbi, TEventName>,
      ): AsyncAssertion;
    }

    interface AssertionStatic {
      __flags: { negate: boolean };
    }

    interface AsyncAssertion extends Assertion, Promise<void> {}
  }
}

interface AsyncAssertionParams<T> {
  subject: T;
  negated: boolean;
  assert: ReturnType<typeof buildAssert>;
}

function asyncAssertion(
  t: Chai.AssertionStatic,
  f: <T>(params: AsyncAssertionParams<T>) => Promise<void>,
) {
  const promise = f.call(t, {
    subject: t._obj,
    negated: t.__flags.negate,
    assert: buildAssert(t.__flags.negate, f),
  });

  /* eslint-disable @typescript-eslint/no-explicit-any */
  (t as any).then = promise.then.bind(promise);
  (t as any).catch = promise.catch.bind(promise);
  (t as any).finally = promise.finally.bind(promise);
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return t;
}

async function getReceipt(v: unknown) {
  if (v instanceof Promise) v = await v;

  if (isReceipt(v)) return v;

  if (isHex(v)) return network.getTransactionReceipt({ hash: v });

  return undefined;
  // throw new Error(`Unable to get receipt for unknown value "${v}"`);
}

function isReceipt(v: unknown): v is TransactionReceipt {
  return typeof v === 'object' && v !== null && 'transactionHash' in v;
}

interface RevertWithParams<
  TAbi extends Abi = Abi,
  TErrorName extends ContractErrorName<TAbi> = ContractErrorName<TAbi>,
> {
  abi: TAbi;
  errorName: ExtractAbiError<TAbi, TErrorName>['name'];
  args?: ContractErrorArgs<TAbi, TErrorName>;
}

interface IncludeEventParams<
  TAbi extends Abi = Abi,
  TEventName extends ContractEventName<TAbi> = ContractEventName<TAbi>,
> {
  abi: TAbi;
  eventName: ExtractAbiEvent<TAbi, TEventName>['name'];
  args?: GetEventArgs<TAbi, TEventName, { EnableUnion: false; IndexedOnly: false; Required: true }>;
}
