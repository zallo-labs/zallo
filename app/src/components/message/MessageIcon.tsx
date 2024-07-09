import { IconProps, materialIcon } from '@theme/icons';
import { createStyles, useStyles } from '@theme/styles';
import { Image } from '#/Image';
import { graphql } from 'relay-runtime';
import { useFragment } from 'react-relay';
import { MessageIcon_message$key } from '~/api/__generated__/MessageIcon_message.graphql';

export const GenericMessageIcon = materialIcon('mail');

const Message = graphql`
  fragment MessageIcon_message on Proposal {
    id
    icon
  }
`;

export interface MessageIconProps extends Partial<IconProps> {
  proposal: MessageIcon_message$key;
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
