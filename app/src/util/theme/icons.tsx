import { ElementType, ComponentPropsWithoutRef, FC } from 'react';
import { ColorValue } from 'react-native';
import { Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { ICON_SIZE } from './paper';
import { Image, ImageProps, ImageSource } from 'expo-image';

export interface IconProps {
  size?: number;
  color?: ColorValue;
}

type NameProp<Props> = Props extends { name: infer Name } ? Name : never;
type Curried<C extends ElementType, Props = ComponentPropsWithoutRef<C>> = (
  name: NameProp<Props>,
) => FC<Omit<Props, 'name'>>;

export const materialIcon: Curried<typeof MaterialIcons> = (name) => (props) => (
  <MaterialIcons name={name} size={ICON_SIZE.small} {...props} />
);

export const materialCommunityIcon: Curried<typeof MaterialCommunityIcons> = (name) => (props) => (
  <MaterialCommunityIcons name={name} size={ICON_SIZE.small} {...props} />
);

export const ionIcon: Curried<typeof Ionicons> = (name) => (props) => (
  <Ionicons name={name} size={ICON_SIZE.small} {...props} />
);

export const HomeIcon = materialIcon('home');
export const ActivityIcon = materialCommunityIcon('chart-timeline-variant');
export const SendIcon = materialCommunityIcon('send');
export const SendOutlineIcon = materialCommunityIcon('send-outline');
export const ReceiveIcon = materialCommunityIcon('arrow-bottom-left');
export const UserIcon = materialIcon('person');
export const UserOutlineIcon = materialIcon('person-outline');
export const ContactsIcon = materialIcon('people');
export const AddIcon = materialCommunityIcon('plus');
export const DeleteIcon = materialCommunityIcon('delete');
export const DeleteOutlineIcon = materialCommunityIcon('delete-outline');
export const EditIcon = materialCommunityIcon('pencil');
export const EditOutlineIcon = materialCommunityIcon('pencil-outline');
export const ScanIcon = materialCommunityIcon('line-scan');
export const MenuIcon = materialCommunityIcon('menu');
export const ShareIcon = materialCommunityIcon('share-variant');
export const CheckIcon = materialCommunityIcon('check');
export const FinalizedIcon = materialCommunityIcon('send-check');
export const CloseIcon = materialCommunityIcon('close');
export const CancelIcon = CloseIcon;
export const RemoveIcon = CloseIcon;
export const ErrorIcon = materialIcon('error');
export const RetryIcon = materialIcon('refresh');
export const SwapIcon = materialCommunityIcon('swap-horizontal');
export const SwapVerticalIcon = materialCommunityIcon('swap-vertical');
export const SearchIcon = materialIcon('search');
export const PlusIcon = materialCommunityIcon('plus');
export const SettingsIcon = materialCommunityIcon('cog');
export const SettingsOutlineIcon = materialCommunityIcon('cog-outline');
export const PayIcon = materialCommunityIcon('contactless-payment');
export const PayCircleIcon = materialCommunityIcon('contactless-payment-circle');
export const PayCircleOutlineIcon = materialCommunityIcon('contactless-payment-circle-outline');
export const DeviceIcon = materialIcon('account-circle');
export const AccountIcon = materialCommunityIcon('bank');
export const WalletIcon = ionIcon('md-wallet');
export const BackIcon = materialIcon('arrow-back');
export const IssueIcon = materialCommunityIcon('github');
export const FeedbackIcon = materialCommunityIcon('chat');
export const TokenCurrencyIcon = materialCommunityIcon('currency-eth');
export const SpendingIcon = materialCommunityIcon('currency-usd');
export const ChevronRightIcon = materialIcon('chevron-right');
export const NavigateNextIcon = materialIcon('navigate-next');
export const QuorumIcon = materialIcon('group');
export const QuorumsIcon = materialIcon('groups');
export const ActivateIcon = materialCommunityIcon('rocket-launch');
export const UndoIcon = materialIcon('undo');
export const CalendarTodayIcon = materialIcon('calendar-today');
export const ReplaceIcon = materialCommunityIcon('arrow-u-right-bottom');
export const ProposeIcon = materialCommunityIcon('send');
export const ViewProposalIcon = materialCommunityIcon('clock-outline');
export const RefreshIcon = materialIcon('refresh');
export const QrCodeIcon = materialCommunityIcon('qrcode');
export const CalendarIcon = materialCommunityIcon('calendar');
export const CalendarOutlineIcon = materialCommunityIcon('calendar-outline');
export const DownArrowIcon = materialIcon('arrow-drop-down');
export const UpArrowIcon = materialIcon('arrow-drop-up');
export const MoreVerticalIcon = materialIcon('more-vert');
export const UserConfigsIcon = materialIcon('apps');
export const ViewIcon = materialCommunityIcon('eye');
export const PasteIcon = materialIcon('content-paste');
export const ExternalLinkIcon = materialIcon('launch');
export const CircleOutlineIcon = materialCommunityIcon('circle-outline');
export const CheckCircleIcon = materialCommunityIcon('check-circle');
export const RejectedCircleIcon = materialCommunityIcon('close-circle');
export const DoubleCheckIcon = materialCommunityIcon('check-all');
export const DescriptionIcon = materialIcon('description');
export const NameIcon = materialIcon('text-fields');
export const NetworkIcon = materialIcon('location-pin');
export const ClockIcon = materialCommunityIcon('clock');
export const ClockOutlineIcon = materialCommunityIcon('clock-outline');
export const GasIcon = materialCommunityIcon('gas-station');
export const GasOutlineIcon = materialCommunityIcon('gas-station-outline');
export const FunctionIcon = materialCommunityIcon('script-text');
export const FunctionOutlineIcon = materialCommunityIcon('script-text-outline');
export const UnknownIcon = materialCommunityIcon('help-circle');
export const UnknownOutlineIcon = materialCommunityIcon('help-circle-outline');
export const NotificationsIcon = materialIcon('notifications');
export const NotificationsOutlineIcon = materialIcon('notifications-none');
export const BluetoothIcon = materialIcon('bluetooth');

export const PolicyIcon = materialCommunityIcon('security');
export const PolicyActiveIcon = materialCommunityIcon('shield');
export const PolicyActiveOutlineIcon = materialCommunityIcon('shield-outline');
export const PolicyEditIcon = materialCommunityIcon('shield-edit');
export const PolicyEditOutlineIcon = materialCommunityIcon('shield-edit-outline');
export const PolicyAddIcon = materialCommunityIcon('shield-plus');
export const PolicyAddOutlineIcon = materialCommunityIcon('shield-plus-outline');
export const PolicyRemoveIcon = materialCommunityIcon('shield-remove');
export const PolicyRemoveOutlineIcon = materialCommunityIcon('shield-remove-outline');
export const PolicySatisfiableIcon = materialCommunityIcon('shield-check');
export const PolicySatisfiableOutlineIcon = materialCommunityIcon('shield-check-outline');
export const PolicyUnsatisfiableIcon = materialCommunityIcon('shield-alert');
export const PolicyUnsatisfiableOutlineIcon = materialCommunityIcon('shield-alert-outline');

export const LogoIcon = fromSource(require('assets/logo.svg'));
export const MastercardIcon = fromSource(require('assets/mastercard.svg'));
export const WalletConnectIcon = fromSource(require('assets/walletconnect.svg'));
export const TwitterIcon = fromSource(require('assets/twitter.svg'));
export const GithubIcon = fromSource(require('assets/github.svg'));
export const LedgerIcon = fromSource(require('assets/ledger-icon.svg'));
export const LedgerLogo = fromSource(require('assets/ledger-logo.svg'));

function fromSource(source: ImageSource) {
  return (props: ImageProps & { size?: number }) => (
    <Image
      {...props}
      source={source}
      {...(props.size && { style: [{ width: props.size, height: props.size }, props.style] })}
    />
  );
}
