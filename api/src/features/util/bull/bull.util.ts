import { BullModuleOptions } from '@nestjs/bull';
import { BullModule } from '@nestjs/bull';
import { BullBoardModule, BullBoardQueueOptions } from '@bull-board/nestjs';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { CONFIG } from '~/config';
import { isTruthy } from 'lib';

export const BULL_BOARD_CREDS =
  CONFIG.bullBoardUser && CONFIG.bullBoardPassword
    ? {
        username: CONFIG.bullBoardUser,
        password: CONFIG.bullBoardPassword,
      }
    : undefined;

export const BULL_BOARD_ENABLED = !!BULL_BOARD_CREDS;

export const registerBullQueue = (...queues: (BullModuleOptions & { name: string })[]) =>
  [
    BullModule.registerQueue(...queues),
    BULL_BOARD_ENABLED &&
      BullBoardModule.forFeature(
        ...queues.map(
          (q): BullBoardQueueOptions => ({
            name: q.name,
            adapter: BullAdapter,
          }),
        ),
      ),
  ].filter(isTruthy);
