import { FragmentType, gql, useFragment } from '@api/generated';
import { IconProps, materialIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image } from '#/Image';

export const GenericMessageIcon = materialIcon('mail');

const Message = gql(/* GraphQL */ `
  fragment MessageIcon_Message on Proposal {
    id
    icon
  }
`);

export interface MessageIconProps extends Partial<IconProps> {
  proposal: FragmentType<typeof Message>;
}

export function MessageIcon({ proposal: proposalFragment, ...iconProps }: MessageIconProps) {
  const { styles } = useStyles(stylesheet);
  const p = useFragment(Message, proposalFragment);

  return p.icon ? (
    <Image source={{ uri: p.icon }} style={styles.icon} {...iconProps} />
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
