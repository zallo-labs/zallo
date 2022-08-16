import { CheckIcon } from '@util/theme/icons';
import { memo } from 'react';
import { Tx } from '~/queries/tx';
import { EventRow } from './EventRow';

export interface ExecutedRowProps {
  tx: Tx;
}

export const ExecutedRow = memo(({ tx }: ExecutedRowProps) => (
  <EventRow Icon={CheckIcon} content="Finalized" timestamp={tx.timestamp} />
));
