import { createStyles, useStyles } from '@theme/styles';
import { ScrollView, ScrollViewProps } from 'react-native';

export type ScrollableProps = ScrollViewProps;

export function Scrollable(props: ScrollableProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      {...props}
      contentContainerStyle={[styles.contentContainer, props.contentContainerStyle]}
    />
  );
}

const stylesheet = createStyles((_, { insets }) => ({
  contentContainer: {
    flexGrow: 1,
    paddingBottom: insets.bottom,
  },
}));
