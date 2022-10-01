import assert from 'assert';
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export interface UserScreenContext {
  sheetShown: boolean;
  setSheetShown: Dispatch<SetStateAction<boolean>>;
}

const CONTEXT = createContext<UserScreenContext | undefined>(undefined);

export const useUserScreenContext = (): UserScreenContext => {
  const context = useContext(CONTEXT);
  assert(context);
  return context;
};

export interface UserScreenContextProviderProps {
  children: ReactNode;
}

export const UserScreenContextProvider = ({
  children,
}: UserScreenContextProviderProps) => {
  const [sheetShown, setSheetShown] = useState(false);

  return (
    <CONTEXT.Provider
      value={{
        sheetShown,
        setSheetShown,
      }}
    >
      {children}
    </CONTEXT.Provider>
  );
};
