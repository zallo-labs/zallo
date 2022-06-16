import { Addr } from '@components/Addr';
import { Box } from '@components/Box';
import { Timestamp } from '@components/Timestamp';
import { isExecutedTx, Tx, TxStatus } from '~/queries/tx/useTxs';
import { hexlify } from 'ethers/lib/utils';
import { useState } from 'react';
import { TouchableOpacity } from 'react-native';
import Collapsible from 'react-native-collapsible';
import { Caption, Paragraph, Subheading, useTheme } from 'react-native-paper';
import { TimelineChevron } from './TimelineChevron';
import { TimelineItem, TimelineItemStatus } from './TimelineItem';
import { useGroupsReachedThreshold } from '~/mutations/tx/useGroupsReachedThreshold';
import { useExecute } from '~/mutations/tx/useExecute';
import { useRevokeApproval } from '~/mutations/tx/useRevokeApproval.api';
import { TimelineButton } from './TimelineButton';

const itemStyles = { marginVertical: 0 };

export interface TimelineProps {
  tx: Tx;
}

export const Timeline = ({ tx }: TimelineProps) => {
  const { colors } = useTheme();
  const execute = useExecute(tx);
  const isApproved = !!useGroupsReachedThreshold()(tx);
  const revoke = useRevokeApproval();

  const getStatus = (status: TxStatus, isLast?: boolean): TimelineItemStatus =>
    tx.status > status || (isLast && tx.status === status)
      ? 'complete'
      : tx.status === status
      ? 'in-progress'
      : 'future';

  const [expanded, setExpanded] = useState(false);

  const proposeStatus = isApproved
    ? 'complete'
    : tx.status === TxStatus.PreProposal
    ? 'requires-action'
    : getStatus(TxStatus.Proposed);

  return (
    <Box>
      <TouchableOpacity
        onPress={() => setExpanded((prev) => !prev)}
        disabled={tx.approvals.length <= 1}
      >
        <TimelineItem
          Left={
            execute?.step === 'approve' ? (
              <TimelineButton color={colors.primary} onPress={execute}>
                Approve
              </TimelineButton>
            ) : tx.userHasApproved && !tx.submissions.length ? (
              <TimelineButton color={colors.accent} onPress={() => revoke(tx)}>
                Revoke
              </TimelineButton>
            ) : tx.status === TxStatus.PreProposal ? (
              <TimelineButton color={colors.primary} onPress={execute}>
                Propose
              </TimelineButton>
            ) : (
              <Subheading style={itemStyles}>Approve</Subheading>
            )
          }
          Right={
            tx.status >= TxStatus.Proposed && tx.approvals.length ? (
              <Box>
                <Caption>
                  <Timestamp time>{tx.proposedAt}</Timestamp>
                </Caption>

                <Paragraph>
                  <Addr addr={tx.approvals[0].addr} />
                </Paragraph>
              </Box>
            ) : undefined
          }
          status={proposeStatus}
          connector
          {...(tx.approvals.length > 1 && {
            renderDot: (props) => (
              <TimelineChevron {...props} expanded={expanded} />
            ),
          })}
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
      </TouchableOpacity>

      <TimelineItem
        Left={
          execute?.step === 'execute' && tx.status === TxStatus.Proposed ? (
            <TimelineButton color={colors.primary} onPress={execute}>
              Execute
            </TimelineButton>
          ) : (
            <Subheading style={itemStyles}>Execute</Subheading>
          )
        }
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
        status={
          tx.status === TxStatus.Proposed && isApproved
            ? 'requires-action'
            : getStatus(TxStatus.Submitted)
        }
        connector
      />

      <TimelineItem
        Left={<Subheading style={itemStyles}>Finalize</Subheading>}
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
