// https://styled-system.com/theme-specification#key-reference
export interface StyledComponentsTheme {
  space: number[];
  radii: number[];
}

export const STYLED_COMPONENTS_THEME: StyledComponentsTheme = {
  space: [],
  radii: [],
};

declare module 'styled-components' {
  export interface DefaultTheme extends StyledComponentsTheme {}
}
