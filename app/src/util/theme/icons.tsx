import { Image, ImageProps, ImageSource, ImageStyle } from 'expo-image';
import { ComponentPropsWithoutRef, Ref, forwardRef } from 'react';
import { ColorValue, StyleProp, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ICON_SIZE } from './paper';

export interface IconProps {
  size?: number;
  color?: ColorValue;
  style?: StyleProp<ImageStyle>;
}

type NameProp<Props> = Props extends { name: infer Name } ? Name : never;

const iconSet = {
  material: MaterialIcons,
  materialCommunity: MaterialCommunityIcons,
};

export const icon =
  <S extends keyof typeof iconSet, Props extends ComponentPropsWithoutRef<(typeof iconSet)[S]>>(
    set: S,
  ) =>
  (name: NameProp<Props>) => {
    return ({ onPress, ...props }: Omit<Props, 'name'>) => {
      const IconSet = iconSet[set];

      return (
        <TouchableOpacity onPress={onPress} disabled={!onPress}>
          <IconSet size={ICON_SIZE.small} {...(props as any)} name={name} />
        </TouchableOpacity>
      );
    };
  };

export const materialIcon = icon('material');
export const materialCommunityIcon = icon('materialCommunity');

export const HomeIcon = materialIcon('home');
export const TransferIcon = materialCommunityIcon('send');
export const UserOutlineIcon = materialIcon('person-outline');
export const ContactsIcon = materialIcon('people');
export const AddIcon = materialCommunityIcon('plus');
export const DeleteIcon = materialCommunityIcon('delete');
export const EditIcon = materialCommunityIcon('pencil');
export const ScanIcon = materialCommunityIcon('line-scan');
export const ShareIcon = materialCommunityIcon('share-variant');
export const CheckIcon = materialCommunityIcon('check');
export const CloseIcon = materialCommunityIcon('close');
export const CancelIcon = CloseIcon;
export const RemoveIcon = CloseIcon;
export const SwapIcon = materialCommunityIcon('swap-horizontal');
export const SwapVerticalIcon = materialCommunityIcon('swap-vertical');
export const SearchIcon = materialIcon('search');
export const SettingsOutlineIcon = materialCommunityIcon('cog-outline');
export const AccountIcon = materialCommunityIcon('bank');
export const BackIcon = materialIcon('arrow-back');
export const NavigateNextIcon = materialIcon('navigate-next');
export const UndoIcon = materialIcon('undo');
export const QrCodeIcon = materialCommunityIcon('qrcode');
export const DownArrowIcon = materialIcon('arrow-drop-down');
export const MoreVerticalIcon = materialIcon('more-vert');
export const PasteIcon = materialIcon('content-paste');
export const ExternalLinkIcon = materialIcon('launch');
export const CheckCircleIcon = materialCommunityIcon('check-circle');
export const ClockOutlineIcon = materialCommunityIcon('clock-outline');
export const UnknownOutlineIcon = materialCommunityIcon('help-circle-outline');
export const NotificationsIcon = materialIcon('notifications');
export const BluetoothIcon = materialIcon('bluetooth');
export const FingerprintIcon = materialIcon('fingerprint');
export const LockOpenIcon = materialIcon('lock-open');
export const UpdateIcon = materialIcon('update');
export const PasswordIcon = materialCommunityIcon('key');
export const DevicesIcon = materialIcon('devices');
export const GenericTokenIcon = materialCommunityIcon('blur');
export const CustomActionIcon = materialCommunityIcon('pentagon-outline');
export const DataIcon = materialCommunityIcon('code-tags');
export const DisconnectIcon = materialCommunityIcon('link-off');
export const GroupIcon = materialCommunityIcon('account-supervisor-circle');
export const RecoveryIcon = materialIcon('lock-reset');
export const SomethingWrongIcon = materialCommunityIcon('robot-dead-outline');
export const PolicyIcon = materialCommunityIcon('security');
export const PolicyEditOutlineIcon = materialCommunityIcon('shield-edit-outline');
export const PolicyRemoveOutlineIcon = materialCommunityIcon('shield-remove-outline');

export const ZalloLogo = imageFromSource(require('assets/logo.svg'));
export const AppScreenshots = imageFromSource(require('assets/screenshots.png'));
export const AppStoreBadge = imageFromSource(require('assets/app-store-badge.svg'));
export const GooglePlayBadge = imageFromSource(require('assets/google-play-badge.png'));
export const WalletConnectIcon = imageFromSource(require('assets/walletconnect-light.svg'));
export const WalletConnectColorIcon = imageFromSource(require('assets/walletconnect.svg'));
export const TwitterIcon = imageFromSource(require('assets/twitter.svg'));
export const GithubIcon = imageFromSource(require('assets/github.svg'));
export const LedgerIcon = imageFromSource(require('assets/ledger-icon.svg'));
export const LedgerLogo = imageFromSource(require('assets/ledger-logo.svg'));
export const AppleWhiteIcon = imageFromSource(require('assets/apple-white.svg'));
export const AppleBlackIcon = imageFromSource(require('assets/apple-black.svg'));
export const GoogleIcon = imageFromSource(require('assets/google.png'));

export function imageFromSource(source: ImageSource) {
  return forwardRef(
    (
      {
        onPress,
        testID: _,
        ...props
      }: ImageProps & { size?: number } & Pick<TouchableOpacityProps, 'onPress'>,
      ref: Ref<TouchableOpacity>,
    ) => (
      <TouchableOpacity ref={ref} onPress={onPress} disabled={!onPress}>
        <Image
          {...props}
          source={source}
          style={[{ ...(props.size && { width: props.size, height: props.size }) }, props.style]}
        />
      </TouchableOpacity>
    ),
  );
}
