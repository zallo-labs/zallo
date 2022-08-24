import { ElementType } from 'react';
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { ComponentPropsWithoutRef, FC } from 'react';

type NameProp<Props> = Props extends { name: infer Name } ? Name : never;
type Curried<C extends ElementType, Props = ComponentPropsWithoutRef<C>> = (
  name: NameProp<Props>,
) => FC<Omit<Props, 'name'>>;

export type IconColor = ComponentPropsWithoutRef<typeof MaterialIcons>['color'];

const material: Curried<typeof MaterialIcons> = (name) => (props) =>
  <MaterialIcons name={name} {...props} />;

const materialCommunity: Curried<typeof MaterialCommunityIcons> =
  (name) => (props) =>
    <MaterialCommunityIcons name={name} {...props} />;

const ionicon: Curried<typeof Ionicons> = (name) => (props) =>
  <Ionicons name={name} {...props} />;

export const ActivityIcon = materialCommunity('chart-timeline-variant');
export const SendIcon = materialCommunity('send');
export const ReceiveIcon = materialCommunity('arrow-bottom-left');
export const ContactsIcon = material('people');
export const HomeIcon = ionicon('wallet');
export const AddIcon = materialCommunity('plus');
export const DeleteIcon = materialCommunity('delete');
export const EditIcon = materialCommunity('pencil');
export const AcceptIcon = materialCommunity('check');
export const RejectIcon = materialCommunity('close');
export const ScanIcon = materialCommunity('line-scan');
export const MenuIcon = materialCommunity('menu');
export const ShareIcon = materialCommunity('share-variant');
export const CheckIcon = materialCommunity('check');
export const FinalizedIcon = materialCommunity('send-check');
export const CloseIcon = materialCommunity('close');
export const CancelIcon = CloseIcon;
export const ErrorIcon = material('error');
export const RetryIcon = material('redo');
export const SwapIcon = materialCommunity('swap-vertical');
export const SearchIcon = material('search');
export const PlusIcon = materialCommunity('plus');
export const PlusCircleIcon = materialCommunity('plus-circle-outline');
export const SettingsIcon = materialCommunity('cog');
export const SettingsOutlineIcon = materialCommunity('cog-outline');
export const PayIcon = materialCommunity('contactless-payment');
export const PayCircleIcon = materialCommunity('contactless-payment-circle');
export const PayCircleOutlineIcon = materialCommunity(
  'contactless-payment-circle-outline',
);
export const AccountIcon = materialCommunity('bank');
export const WalletIcon = ionicon('md-wallet');
export const BackIcon = material('arrow-back');
export const NextIcon = material('arrow-forward');
export const IssueIcon = materialCommunity('github');
export const FeedbackIcon = materialCommunity('chat');
export const TokenCurrencyIcon = materialCommunity('currency-eth');
export const ChevronRight = material('chevron-right');
export const QuorumIcon = material('group');
export const DeployIcon = materialCommunity('rocket-launch');
export const UndoIcon = material('undo');
