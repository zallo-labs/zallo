import { Subheading, useTheme } from 'react-native-paper';
import { Approver } from 'lib';
import { Addr } from '@components/Addr';
import { Identicon } from '@components/Identicon';
import { Item, ItemProps } from '@components/list/Item';
import { WeightField } from './WeightField';
import { SwipeToDelete } from './SwipeToDelete';
import { showError } from '@components/Toast';

export interface ApproverItemProps extends ItemProps {
  approver: Approver;
  setApprover: (approver: Approver) => void;
  isOnlyApprover?: boolean;
}

export const ApproverItem = ({
  approver,
  setApprover,
  isOnlyApprover,
  ...liProps
}: ApproverItemProps) => {
  const { colors } = useTheme();

  return (
    <SwipeToDelete
      onDelete={() =>
        isOnlyApprover
          ? showError("Can't delete only approver")
          : setApprover(undefined)
      }
      enabled={!isOnlyApprover}
    >
      <Item
        Left={<Identicon seed={approver.addr} />}
        Main={
          <Subheading>
            <Addr addr={approver.addr} />
          </Subheading>
        }
        Right={
          <WeightField
            weight={approver.weight}
            setWeight={(weight) =>
              setApprover({
                ...approver,
                weight,
              })
            }
          />
        }
        backgroundColor={colors.background}
        {...liProps}
      />
    </SwipeToDelete>
  );
};
