import { Operation } from './layer';

export class OperationError extends Error {
  constructor(
    public operation: Operation,
    public response?: Response,
    public cause?: Error,
  ) {
    const message =
      `Failed to execute operation ${operation.kind} ${operation.name}: ` +
      (response?.statusText ?? cause?.message ?? 'unknown error - no response or cause');
    super(message);

    this.name = OperationError.name;
  }
}
