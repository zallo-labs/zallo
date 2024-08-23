import Clipboard from '@react-native-clipboard/clipboard';
import { showInfo } from '#/Snackbar';

export interface ShareOptions {
  message?: string;
  url: string;
}

export function share({ url }: ShareOptions) {
  Clipboard.setString(url);
  showInfo('Link copied');
}
