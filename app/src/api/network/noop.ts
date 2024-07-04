import { Exchange } from './layer';

const noopExchange: Exchange =
  ({ forward }) =>
  (requests$) => {
    const operationResult = forward(requests$);

    return operationResult;
  };
