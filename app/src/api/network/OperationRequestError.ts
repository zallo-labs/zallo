import { OperationRequest } from './layer';

export class OperationRequestError extends Error {
  constructor(
    public request: OperationRequest,
    public response?: Response,
    public cause?: Error,
  ) {
    const message =
      `Failed to execute operation ${request.kind} ${request.operation.name}: ` +
      (response?.statusText ?? cause?.message ?? 'unknown error - no response or cause');
    super(message);

    this.name = OperationRequestError.name;
  }
}
