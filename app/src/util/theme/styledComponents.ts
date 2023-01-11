// https://styled-system.com/theme-specification#key-reference
export interface StyledComponentsTheme {
  space: number[];
  radii: number[];
}

const spaceDef = [0, 8, 16, 24, 32, 40, 48, 56, 64] as const;
export type Space = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

const mutableSpace = spaceDef as unknown as number[];
export const STYLED_COMPONENTS_THEME: StyledComponentsTheme = {
  space: mutableSpace,
  radii: mutableSpace,
};

declare module 'styled-components' {
  export interface DefaultTheme extends StyledComponentsTheme {}
}

export const space = (n: Space) => STYLED_COMPONENTS_THEME.space[n];
export const radius = (n: number) => STYLED_COMPONENTS_THEME.radii[n];

export const typoSpace = (n: number) => n * 4;

export const space2 = (
  n:
    | 4
    | 8
    | 12
    | 16
    | 20
    | 24
    | 28
    | 32
    | 36
    | 40
    | 44
    | 48
    | 52
    | 56
    | 60
    | 64
    | 68
    | 72
    | 76
    | 80
    | 84
    | 88
    | 92
    | 96
    | 100
    | 128
    | 256
    | 360
    | 512
    | 720,
) => n;

export const font = (n: number) => n * 2;
