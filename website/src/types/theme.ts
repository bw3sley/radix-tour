export type ThemeKey = "dark" | "light" | "brand" | "unstyled";

export interface Theme {
  label: string;
  bg: string;
  fg: string;
  sub: string;
  border: string;
  line: string;
  radius: number;
  shadow: string;
  btnBg: string;
  btnFg: string;
  btnBorder: string;
  btnRadius: number;
  ghost: string;
  font: string;
  arrow: "block" | "none";
  contentClass: string;
  arrowClass: string;
}
