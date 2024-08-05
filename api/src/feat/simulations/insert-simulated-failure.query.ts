// GENERATED by @edgedb/generate v0.5.4

import type {Executor} from "edgedb";

export type InsertSimulatedFailureArgs = {
  readonly "transaction": string;
  readonly "response": string;
  readonly "gasUsed": bigint;
  readonly "reason": string;
};

export type InsertSimulatedFailureReturns = {
  "id": string;
};

export function insertSimulatedFailure(client: Executor, args: InsertSimulatedFailureArgs): Promise<InsertSimulatedFailureReturns> {
  return client.queryRequiredSingle(`\
insert SimulatedFailure {
  transaction := <Transaction><uuid>$transaction,
  response := <Bytes>$response,
  gasUsed := <bigint>$gasUsed,
  reason := <str>$reason
}`, args);

}
