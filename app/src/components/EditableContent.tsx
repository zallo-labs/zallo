import { CancelIcon, CheckIcon, EditOutlineIcon } from '@theme/icons';
import { makeStyles } from '@theme/makeStyles';
import { ReactNode, useState } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Box } from './layout/Box';

export interface EditableContentProps {
  content: ReactNode;
  editContent: ReactNode;
  onSubmit: (() => void) | undefined;
  onCancel?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  editing: boolean;
  setEditing: (editing: boolean) => void;
}

export const EditableContent = ({
  content: Content,
  editContent: EditContent,
  onSubmit,
  onCancel,
  containerStyle,
  editing,
  setEditing,
}: EditableContentProps) => {
  return (
    <Box horizontal alignItems="center" pb={2} style={containerStyle}>
      {!editing ? (
        Content
      ) : (
        <>
          <Box flex={1}>{EditContent}</Box>

          <Box ml={1}>
            <IconButton
              icon={CancelIcon}
              onPress={() => {
                onCancel?.();
                setEditing(false);
              }}
            />
          </Box>

          <IconButton
            icon={CheckIcon}
            disabled={!onSubmit}
            mode="contained"
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
