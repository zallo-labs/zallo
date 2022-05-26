import { FC, useState } from 'react';
import { Pressable } from 'react-native';
import { ChildrenProps } from '@util/children';
import { FormattedAddr, FormattedAddrProps } from './FormattedAddr';

export interface ExpandableAddrProps extends FormattedAddrProps {
  children: FC<ChildrenProps>;
}

export const ExpandableAddr = ({
  children: Child,
  ...props
}: ExpandableAddrProps) => {
  const [full, setFull] = useState(props.full);

  return (
    <Pressable onLongPress={() => setFull((prev) => !prev)}>
      <Child>
        <FormattedAddr {...props} full={full} />
      </Child>
    </Pressable>
  );
};
