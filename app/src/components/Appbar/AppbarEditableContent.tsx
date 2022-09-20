import { CancelIcon, CheckIcon, EditOutlineIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ReactNode, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Box } from '../layout/Box';

export interface AppbarEditableContentProps {
  content: ReactNode;
  editContent: ReactNode;
  onSubmit: (() => void) | undefined;
  onCancel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

export const AppbarEditableContent = ({
  content: Content,
  editContent: EditContent,
  onSubmit,
  onCancel,
  containerStyle,
}: AppbarEditableContentProps) => {
  const styles = useStyles();

  const [editing, setEditing] = useState(false);

  return (
    <Box horizontal alignItems="center" pb={2} style={containerStyle}>
      {!editing ? (
        <>
          <Box style={styles.iconButtonPlaceholder} />

          <Box flex={1} mx={1}>
            {Content}
          </Box>

          <IconButton icon={EditOutlineIcon} onPress={() => setEditing(true)} />
        </>
      ) : (
        <>
          <IconButton
            icon={CancelIcon}
            onPress={() => {
              onCancel?.();
              setEditing(false);
            }}
          />

          <Box flex={1} mx={1}>
            {EditContent}
          </Box>

          <IconButton
            icon={CheckIcon}
            disabled={!onSubmit}
            onPress={() => {
              onSubmit?.();
              setEditing(false);
            }}
          />
        </>
      )}
    </Box>
  );
};

const useStyles = makeStyles(({ iconButton }) => ({
  iconButtonPlaceholder: {
    width: iconButton.containerSize,
  },
  editIcon: {
    alignSelf: 'flex-end',
  },
}));
