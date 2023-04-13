import { makeStyles } from '@theme/makeStyles';
import { StyleProp, useWindowDimensions, ViewStyle } from 'react-native';
import { Text } from 'react-native-paper';
import { Carousel } from 'react-native-snap-carousel';

const POINTS = [
  'Self custodial smart wallet',
  'The flexibility of a hot wallet, with the security of a cold wallet',
];

export interface OnboardCarouselProps {
  style?: StyleProp<ViewStyle>;
}

export const OnboardCarousel = ({ style }: OnboardCarouselProps) => {
  const styles = useStyles();
  const window = useWindowDimensions();

  return (
    <Carousel
      data={POINTS}
      renderItem={({ item }) => (
        <Text variant="headlineSmall" style={[styles.text, style]}>
          {item}
        </Text>
      )}
      layout="default"
      vertical={false}
      itemWidth={window.width}
      sliderWidth={window.width}
      autoplay
      autoplayInterval={5000}
    />
  );
};

const useStyles = makeStyles(() => ({
  text: {
    textAlign: 'center',
  },
}));
