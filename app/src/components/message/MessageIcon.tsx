import { FragmentType, gql, useFragment } from '@api/generated';
import { IconProps, materialIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image } from 'expo-image';

export const GenericMessageIcon = materialIcon('mail');

const Message = gql(/* GraphQL */ `
  fragment MessageIcon_Message on Proposal {
    id
    iconUri
  }
`);

export interface MessageIconProps extends Partial<IconProps> {
  proposal: FragmentType<typeof Message>;
}

export function MessageIcon({ proposal: proposalFragment, ...iconProps }: MessageIconProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, proposalFragment);

  return p.iconUri ? (
    <Image source={{ uri: p.iconUri }} style={styles.icon} {...iconProps} />
  ) : (
    <GenericMessageIcon {...iconProps} />
  );
}

const stylesheet = createStyles(({ iconSize, corner }) => ({
  icon: {
    width: iconSize.medium,
    height: iconSize.medium,
    borderRadius: corner.l,
  },
}));
