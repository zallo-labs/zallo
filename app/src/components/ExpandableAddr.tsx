import { FC, useState } from 'react';
import { TouchableOpacity } from 'react-native';
import { ChildrenProps } from '@util/children';
import { Addr, AddrProps } from './Addr';

export interface ExpandableAddrProps extends AddrProps {
  children: FC<ChildrenProps>;
}

export const ExpandableAddr = ({
  children: Child,
  ...props
}: ExpandableAddrProps) => {
  const [full, setFull] = useState(props.full);

  return (
    <TouchableOpacity onLongPress={() => setFull((prev) => !prev)}>
      <Child>
        <Addr {...props} full={full} />
      </Child>
    </TouchableOpacity>
  );
};
