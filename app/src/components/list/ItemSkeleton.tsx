import { Skeleton } from '@components/skeleton/Skeleton';
import { Rect, Circle } from 'react-content-loader/native';

export const ItemSkeleton = () => (
  <Skeleton width={150} height={40}>
    <Rect x="48" y="8" rx="3" ry="3" width="100" height="6" />
    <Rect x="48" y="26" rx="3" ry="3" width="52" height="6" />
    <Circle cx="20" cy="20" r="20" />
  </Skeleton>
);
