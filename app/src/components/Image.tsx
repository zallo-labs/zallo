import * as Base from 'expo-image';

export type ImageProps = Base.ImageProps;

export function Image(props: ImageProps) {
  return <Base.Image cachePolicy="memory-disk" {...props} />;
}
