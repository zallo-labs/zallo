import type { ShareOptions } from './index';
import { Share } from 'react-native';

export function share({ message, url }: ShareOptions) {
  Share.share({ url, message: message || url });
}
