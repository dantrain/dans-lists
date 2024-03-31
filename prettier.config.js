/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
const config = {
  plugins: [
    "prettier-plugin-organize-imports",
    "prettier-plugin-packagejson",
    "prettier-plugin-tailwindcss",
    "prettier-plugin-classnames",
    "prettier-plugin-merge",
  ],
  tailwindFunctions: ["cva", "cx", "twMerge"],
  customFunctions: ["cva", "cx", "twMerge"],
  endingPosition: "absolute-with-indent",
};

export default config;
