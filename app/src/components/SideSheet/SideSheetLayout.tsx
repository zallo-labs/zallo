import { createStyles, useStyles } from '@theme/styles';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { useSideSheetType } from './SideSheetSurface';

const context = createContext<{ visible: boolean; show: Dispatch<SetStateAction<boolean>> } | null>(
  null,
);

export const useSideSheet = () => {
  const c = useContext(context);
  if (!c)
    throw new Error("Attempting to use 'useSideSheet' outside of a 'SideSheetLayout' context");

  return c;
};

export interface SideSheetLayoutProps {
  children: ReactNode;
}

export function SideSheetLayout({ children }: SideSheetLayoutProps) {
  const { styles } = useStyles(stylesheet);
  const type = useSideSheetType();
  const [visible, show] = useState(type === 'standard');

  return (
    <context.Provider value={{ visible, show }}>
      <View style={styles.container}>{children}</View>
    </context.Provider>
  );
}

const stylesheet = createStyles({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
});
