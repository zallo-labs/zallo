import { render } from '@testing-library/react-native';
import { Text } from 'react-native-paper';

const Test = () => <Text>Test</Text>;

describe('Test', () => {
  it('renders correctly', async () => {
    // const tree = render(<Test />);

    // expect(tree.toJSON()).toMatchSnapshot();
  });
});
