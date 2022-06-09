import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { isExecutedTx, Tx, TxStatus } from '@gql/queries/useTxs';
import { hexlify } from 'ethers/lib/utils';
import { useState } from 'react';
import { Pressable } from 'react-native';
import Collapsible from 'react-native-collapsible';
import {
  Button,
  Caption,
  Paragraph,
  Subheading,
  useTheme,
} from 'react-native-paper';
import { TimelineChevron } from './TimelineChevron';
import { TimelineItem, TimelineItemStatus } from './TimelineItem';

export interface TimelineProps {
  tx: Tx;
}

export const Timeline = ({ tx }: TimelineProps) => {
  const { colors } = useTheme();

  const getStatus = (status: TxStatus, isLast?: boolean): TimelineItemStatus =>
    tx.status > status || (isLast && tx.status === status)
      ? 'done'
      : tx.status === status
      ? 'current'
      : 'future';

  const [expanded, setExpanded] = useState(false);

  const proposeStatus = getStatus(TxStatus.Proposed);

  return (
    <Box vertical mt={1} mb={1} minHeight={200}>
      <Pressable onPress={() => setExpanded((prev) => !prev)}>
        <TimelineItem
          Left={<Subheading>Propose</Subheading>}
          Right={
            <Box>
              <Caption>
                <Timestamp time>{tx.proposedAt}</Timestamp>
              </Caption>

              <Paragraph>
                <Addr addr={tx.approvals[0].addr} />
              </Paragraph>
            </Box>
          }
          status={proposeStatus}
          connector
          renderDot={(props) => (
            <TimelineChevron {...props} expanded={expanded} />
          )}
        />

        <Collapsible collapsed={!expanded}>
          {tx.approvals.slice(1).map(({ addr, timestamp }) => (
            <TimelineItem
              key={addr}
              Right={
                <Box>
                  <Caption>
                    <Timestamp time>{timestamp}</Timestamp>
                  </Caption>

                  <Paragraph>
                    <Addr addr={addr} />
                  </Paragraph>
                </Box>
              }
              status={proposeStatus}
              connector
            />
          ))}
        </Collapsible>
      </Pressable>

      <TimelineItem
        Left={<Subheading>Submit</Subheading>}
        Right={
          <Box>
            {tx.submissions.map((s) => (
              <Caption
                key={hexlify(s.hash)}
                style={!s.finalized ? { color: colors.primary } : undefined}
              >
                <Timestamp time>{s.createdAt}</Timestamp>
              </Caption>
            ))}
          </Box>
        }
        status={getStatus(TxStatus.Submitted)}
        connector
      />

      <TimelineItem
        Left={<Subheading>Execute</Subheading>}
        Right={
          isExecutedTx(tx) && (
            <Box>
              <Caption>
                <Timestamp time>{tx.executedAt}</Timestamp>
              </Caption>

              <Paragraph>
                <Addr addr={tx.executor} />
              </Paragraph>
            </Box>
          )
        }
        status={getStatus(TxStatus.Executed, true)}
      />
    </Box>
  );
};
