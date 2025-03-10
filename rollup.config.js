import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";

export default {
  input: "src/lib/index.js",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
  },
  external: ["stylelint", "css-tree", "postcss", "postcss-value-parser"],
  plugins: [resolve(), commonjs(), terser()],
};
