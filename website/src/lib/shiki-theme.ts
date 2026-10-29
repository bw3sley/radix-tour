import { createCssVariablesTheme } from "shiki";

// Colors come from the --shiki-* tokens in globals.css.
export const shikiTheme = createCssVariablesTheme({
  name: "css-variables",
  variablePrefix: "--shiki-",
  variableDefaults: {},
  fontStyle: true,
});
