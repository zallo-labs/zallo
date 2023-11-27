export type Id = string & { readonly isId: true };

export const toId = (val: string): Id => val.toLowerCase() as Id;
