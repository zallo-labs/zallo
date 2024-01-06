import { useEffect } from 'react';
import { useImmerAtom } from 'jotai-immer';
import _ from 'lodash';
import { match } from 'ts-pattern';

import { SelectChip } from '~/components/fields/SelectChip';
import { useMemoApply } from '~/hooks/useMemoized';
import { POLICY_DRAFT_ATOM } from '~/lib/policy/draft';
import { DownArrowIcon } from '~/util/theme/icons';
import { createStyles, useStyles } from '~/util/theme/styles';

const getLabel = (threshold: number) =>
  match(threshold)
    .with(0, () => 'No approvals required')
    .with(1, () => '1 approval required')
    .otherwise((n) => `${n} approvals required`);

export function ThresholdChip() {
  const [{ threshold, approvers }, updateDraft] = useImmerAtom(POLICY_DRAFT_ATOM);
  const { styles } = useStyles(useMemoApply(getStylesheet, { threshold }));

  const validThresholds = _.range(Math.min(approvers.size, 1), approvers.size + 1);
  const entries = validThresholds.map((n) => [getLabel(n), n] as const);

  useEffect(() => {
    if (!validThresholds.includes(threshold)) {
      updateDraft((draft) => {
        draft.threshold = draft.approvers.size;
      });
    }
  }, [validThresholds, threshold, updateDraft]);

  return (
    <SelectChip
      value={Math.min(threshold, approvers.size)}
      entries={entries}
      onChange={(value) =>
        updateDraft((draft) => {
          draft.threshold = value;
        })
      }
      chipProps={{
        closeIcon: DownArrowIcon,
        style: styles.chip,
        textStyle: styles.chipLabel,
      }}
    />
  );
}

const getStylesheet = ({ threshold }: { threshold: number }) =>
  createStyles(({ colors }) => ({
    chip: {
      ...(!threshold && {
        backgroundColor: colors.warningContainer,
      }),
    },
    chipLabel: {
      ...(!threshold && {
        color: colors.onWarningContainer,
      }),
    },
  }));
