import includesAny from "array-includes-any";

// common plugins
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
// @ts-ignore
import autoExternal from "rollup-plugin-auto-external";

import typescript from "@rollup/plugin-typescript";
import coffeescript from "rollup-plugin-coffee-script";
import json from "@rollup/plugin-json";
import cssOnly from "rollup-plugin-css-only";
import babel from "@rollup/plugin-babel";

export type Plugin =
  | "js"
  | "ts"
  | "coffee"
  | "json"
  | "css"
  | "babel"
  | ["ts", typeof typescript]
  | ["babel", typeof babel]
  | ["coffee", typeof coffeescript]
  | ["json", typeof json]
  | ["css", typeof cssOnly];

// function to check if the first array has any of the second array
// first array can have `[string, object]` as their input
function includesAny(
  arr1: Array<string | [string, Object]>,
  arr2: Array<string>
): null | number {
  for (let index = 0; index < arr1.length; index++) {
    const elm = arr1[index];
    let name: string;
    if (typeof elm === "string") {
      // plugin name only
      name = elm;
    } else {
      // plugin with options
      name = elm[0];
    }
    if (arr2.includes(name)) {
      return index;
    }
  }
  return null;
}
export function createPlugins(
  languages: Array<string> = ["ts", "js", "json", "coffee"],
  babel: boolean = true,
  extraPlugins?: Array<any>
) {
  let plugins = []

  // language specific
  // typescript
  if (includesAny(languages, ["ts", ".ts", "typescript", "TypeScript"])) {
    const typescript = require("@rollup/plugin-typescript");
    plugins.push(
      typescript({
        noEmitOnError: false,
      })
    );
  }
  // coffeescript
  if (
    includesAny(languages, [
      "coffee",
      ".coffee",
      "coffeescript",
      "coffee-script",
      "CoffeeScript",
    ])
  ) {
    const coffeescript = require("rollup-plugin-coffee-script");
    plugins.push(coffeescript());
  }
  // json
  if (includesAny(languages, ["json", ".json", "JSON"])) {
    const json = require("@rollup/plugin-json");
    plugins.push(json({ compact: true }));
  }

  // css only
  if (includesAny(languages, ["css", ".css"])) {
    console.log(`
      css only was chosen to bundle css files into a single file.
      This plugin requires you to import css files in a dummy js file and pass it as an input to rollup.
      This should be done in a separate step from src code bundling
    `);
    const cssOnly = require("rollup-plugin-css-only");
    plugins.push(cssOnly({ output: "dist/bundle.css" }));
    // minify css
    if (process.env.NODE_ENV === "production") {
      const execute = require("rollup-plugin-execute");
      plugins.push(execute(["csso dist/bundle.css --output dist/bundle.css"]));
    }
  }

  // babel for js and coffee
  if (babel || languages.includes("babel")) {
    const { babel } = require("@rollup/plugin-babel");
    plugins.push(
      babel({
        extensions: [".js", ".jsx", ".mjs", ".coffee"],
        babelHelpers: "bundled",
      })
    );
  }

  // extra plugins
  if (extraPlugins) {
    plugins.push(...extraPlugins);
  }

  let pluginsCommon = [
    autoExternal({
      builtins: true,
      dependencies: false,
      peerDependencies: false,
    }),

    // so Rollup can find externals
    resolve({
      extensions: [".ts", ".js", ".coffee", ".tsx", ".jsx", ".mjs"],
      preferBuiltins: true,
    }),

    // so Rollup can convert externals to an ES module
    commonjs(),
  ];

  plugins.push(...pluginsCommon)

  // minify only in production mode
  if (process.env.NODE_ENV === "production") {
    plugins.push(
      terser({
        ecma: 2018,
        warnings: true,
        compress: {
          drop_console: false,
        },
      })
    );
  }

  return plugins;
}

export function createConfig(
  input: string | Array<string> = "src/main.ts",
  output_dir: string = "dist",
  output_format = "cjs",
  externals: Array<string> = ["atom", "electron"],
  plugins = createPlugins()
) {
  return {
    input: input,
    output: [
      {
        dir: output_dir,
        format: output_format,
        sourcemap: true,
      },
    ],
    // loaded externally
    external: externals,
    plugins: plugins,
  };
}
