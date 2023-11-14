import { FC } from 'react';
import { ListItemProps } from '~/components/list/ListItem';

export interface Suggestion {
  Item: FC<Partial<ListItemProps>>;
  complete: boolean;
}
