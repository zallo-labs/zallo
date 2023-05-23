import { Logger } from '@nestjs/common';

export const enableExceptionHooks = () => {
  process.on('unhandledRejection', (reason) => Logger.error('Unhandled rejection: ', reason));

  process.on('uncaughtException', (error, origin) =>
    Logger.error('Unhandled exception', { error, origin }),
  );
};
