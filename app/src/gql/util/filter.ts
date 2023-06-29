export function onlyTypes<T extends { __typename?: string }, Typename extends T['__typename']>(
  ...typenames: Typename[]
) {
  return (element: T): element is Extract<T, { __typename?: Typename }> => {
    return typenames.includes(element.__typename as Typename);
  };
}
