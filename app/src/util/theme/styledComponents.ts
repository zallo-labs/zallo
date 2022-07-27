// https://styled-system.com/theme-specification#key-reference
export interface StyledComponentsTheme {
  space: number[];
  radii: number[];
}

const spaceDef = [0, 4, 8, 16, 32, 48, 64];
export const STYLED_COMPONENTS_THEME: StyledComponentsTheme = {
  space: spaceDef,
  radii: spaceDef,
};

declare module 'styled-components' {
  export interface DefaultTheme extends StyledComponentsTheme {}
}

export const space = (n: number) => STYLED_COMPONENTS_THEME.space[n];
export const radius = (n: number) => STYLED_COMPONENTS_THEME.radii[n];
