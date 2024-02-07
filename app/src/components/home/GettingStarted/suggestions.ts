import { FC } from 'react';
import { ListItemProps } from '#/list/ListItem';

export interface Suggestion {
  Item: FC<Partial<ListItemProps>>;
  complete: boolean;
}
