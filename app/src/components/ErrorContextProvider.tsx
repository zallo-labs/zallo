import { nothing } from 'immer';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { Updater, useImmer } from 'use-immer';

interface Context {
  errors: Map<string, string>;
  updateErrors: Updater<Map<string, string>>;
}

const CONTEXT = createContext<Context>({
  errors: new Map(),
  updateErrors: () => {
    // noop
  },
});

export interface ErrorContextProviderProps {
  children: ReactNode;
}

export const ErrorContextProvider = ({ children }: ErrorContextProviderProps) => {
  const [errors, updateErrors] = useImmer(new Map<string, string>());

  return <CONTEXT.Provider value={{ errors, updateErrors }}>{children}</CONTEXT.Provider>;
};

export const useTrackError = (key: string, error?: string | false) => {
  const { updateErrors } = useContext(CONTEXT);

  useEffect(() => {
    updateErrors((errors) => {
      const prev = errors.get(key);
      if (prev === error) return nothing;

      if (error) {
        errors.set(key, error);
      } else {
        errors.delete(key);
      }
    });
  }, [updateErrors, key, error]);
};

export const useErrorContext = () => useContext(CONTEXT).errors;
