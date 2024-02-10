import { createStyles, useStyles } from '@theme/styles';
import { Dispatch, ReactNode, SetStateAction, createContext, useContext, useState } from 'react';
import { View } from 'react-native';
import { useSideSheetType } from './SideSheetSurface';

const context = createContext<{ visible: boolean; show: Dispatch<SetStateAction<boolean>> }>({
  visible: false,
  show: () => {},
});

export const useSideSheet = () => useContext(context);

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
