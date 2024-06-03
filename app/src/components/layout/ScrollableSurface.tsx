import { ScrollView, ScrollViewProps } from 'react-native';
import { Surface, SurfaceProps } from './Surface';

export interface ScrollableSurfaceProps extends ScrollViewProps {
  surface?: SurfaceProps;
}

export function ScrollableSurface({ surface, ...props }: ScrollableSurfaceProps) {
  return (
    <Surface {...surface}>
      <ScrollView {...props}></ScrollView>
    </Surface>
  );
}
