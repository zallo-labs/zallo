import { ComponentPropsWithoutRef, useCallback, useEffect, useRef, useState } from 'react';
import { Text, TextProps } from 'react-native';
import TypeWriter from 'react-native-typewriter';
import { TypewriterCursor } from './TypewriterCursor';
import { match } from 'ts-pattern';

export interface TypewriterValue {
  text: string;
  completeDelay?: number;
}

type TypeWriterProps = ComponentPropsWithoutRef<typeof TypeWriter>;
export interface TypewriterTextProps
  extends Omit<TextProps, 'children' | 'style'>,
    Pick<TypeWriterProps, 'initialDelay' | 'minDelay' | 'maxDelay' | 'style'> {
  values: TypewriterValue[];
  loop?: boolean;
  completeDelay?: number;
  backspaceDelay?: number;
}

export function TypewriterText({
  values,
  loop,
  completeDelay,
  backspaceDelay = 40,
  initialDelay,
  minDelay,
  maxDelay,
  ...textProps
}: TypewriterTextProps) {
  const [index, setIndex] = useState(0);
  const [action, setAction] = useState<'+' | '-'>('+');
  const value = values[index];

  const timer = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    return () => clearTimeout(timer.current);
  }, []);

  const handleEnd = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = undefined;

    match(action)
      .with('+', () => {
        timer.current = setTimeout(() => {
          setAction('-');
        }, value.completeDelay ?? completeDelay);
      })
      .with('-', () => {
        setAction('+');
        setIndex((i) => (i < values.length - 1 ? i + 1 : loop ? 0 : i));
      })
      .exhaustive();
  }, [action, completeDelay, loop, value.completeDelay, values.length]);

  return (
    <Text>
      <TypeWriter
        typing={action === '+' ? 1 : -1}
        onTypingEnd={handleEnd}
        initialDelay={initialDelay}
        minDelay={action === '+' ? minDelay : backspaceDelay}
        maxDelay={action === '+' ? maxDelay : backspaceDelay}
        {...textProps}
      >
        {value.text}
      </TypeWriter>

      <TypewriterCursor {...textProps} />
    </Text>
  );
}
