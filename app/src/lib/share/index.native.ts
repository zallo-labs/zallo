import { Share } from 'react-native';
import type { ShareOptions } from './index';

export function share({ message, url }: ShareOptions) {
  Share.share({ url, message: message || url });
}
