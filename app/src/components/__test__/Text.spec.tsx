import Test from '@components/Test';
import { render } from '@testing-library/react-native';

describe('Test', () => {
  it('renders correctly', async () => {
    const tree = render(<Test />);

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
