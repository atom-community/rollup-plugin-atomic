import { includesAny } from "./utils"

// common plugins
import type resolve from "@rollup/plugin-node-resolve"
import type commonjs from "@rollup/plugin-commonjs"
import type { terser } from "rollup-plugin-terser"
import type sourcemaps from "rollup-plugin-sourcemaps"
import type replace from "@rollup/plugin-replace"
// @ts-ignore
import type autoExternal from "rollup-plugin-auto-external"
import type typescript from "@rollup/plugin-typescript"
// @ts-ignore
import type coffeescript from "rollup-plugin-coffee-script"
import type json from "@rollup/plugin-json"
// @ts-ignore
import type cssOnly from "rollup-plugin-css-only"
import type babel from "@rollup/plugin-babel"
import type { wasm } from "@rollup/plugin-wasm"
// @ts-ignore
import type { asc } from "rollup-plugin-assemblyscript"

export type Plugin =
  | "js"
  | "ts"
  | "coffee"
  | "json"
  | "css"
  | "babel"
  | "wasm"
  | "as"
  | "terser"
  | "replace"
  | "sourcemaps"
  | "commonjs"
  | "resolve"
  | ["ts", typeof typescript, boolean?]
  | ["babel", typeof babel, boolean?]
  | ["coffee", typeof coffeescript, boolean?]
  | ["json", typeof json, boolean?]
  | ["css", typeof cssOnly, boolean?]
  | ["wasm", typeof wasm, boolean?]
  | ["as", typeof asc, boolean?]
  | ["terser", typeof terser, boolean?]
  | ["replace", typeof replace, boolean?]
  | ["sourcemaps", typeof sourcemaps, boolean?]
  | ["commonjs", typeof commonjs, boolean?]
  | ["resolve", typeof resolve, boolean?]

export function createPlugins(
  inputPluginsNames: Array<Plugin> = ["ts", "js", "json", "coffee"],
  extraPlugins?: Array<any>
) {
  let plugins = []

  // language specific

  // typescript
  pushPlugin(["ts", ".ts", "typescript", "TypeScript"], ["@rollup/plugin-typescript"], {
    noEmitOnError: false,
    module: "ESNext", // do not modify the imports
  })

  // coffeescript
  pushPlugin(
    ["coffee", ".coffee", "coffeescript", "coffee-script", "CoffeeScript", "cs"],
    ["rollup-plugin-coffee-script"]
  )

  // json
  pushPlugin(["json", ".json", "JSON"], ["@rollup/plugin-json"], { compact: true })

  // css only
  const cssIndex = includesAny(inputPluginsNames, ["css", ".css"])
  if (cssIndex !== null) {
    const cssOnly = require("rollup-plugin-css-only")
    console.log(`
      css only was chosen to bundle css files into a single file.
      This plugin requires you to import css files in a dummy js file and pass it as an input to rollup.
      This should be done in a separate step from src code bundling
    `)
    if (typeof inputPluginsNames[cssIndex] === "string") {
      // plugin name only
      plugins.push(cssOnly({ output: "dist/bundle.css" }))
    } else {
      // plugin with options
      plugins.push(cssOnly(inputPluginsNames[cssIndex][1]))
    }
    // minify css
    if (process.env.NODE_ENV === "production") {
      // TODO get the output from the plugin when the user uses options
      const execute = require("rollup-plugin-execute")
      plugins.push(execute(["csso dist/bundle.css --output dist/bundle.css"]))
    }
  }

  pushPlugin(["babel"], ["@rollup/plugin-babel", "babel"], {
    extensions: [".js", ".jsx", ".mjs", ".coffee"],
    babelHelpers: "bundled",
  })

  // wasm
  pushPlugin(["wasm", "WebAssembly"], ["@rollup/plugin-wasm", "wasm"])

  // as
  pushPlugin(["as", "asc", "assemblyscript", "AssemblyScript"], ["rollup-plugin-assemblyscript", "asc"])

  // visualizer
  pushPlugin(["visualizer", "plot"], ["rollup-plugin-visualizer"], { sourcemap: true, open: true })

  // extra plugins
  if (extraPlugins !== undefined && typeof extraPlugins === "object" /*array*/) {
    try {
      plugins.push(...extraPlugins)
    } catch (e) {
      console.error("You should pass extraPlugins as an array")
    }
  }

  // Default plugins

  // loading files with existing source maps
  pushPlugin(["sourcemaps"], ["rollup-plugin-sourcemaps"], {}, true)

  pushPlugin(
    ["autoExternal"],
    ["rollup-plugin-auto-external"],
    {
      builtins: true,
      dependencies: false,
      peerDependencies: false,
    },
    true
  )

  // so Rollup can find externals
  pushPlugin(
    ["resolve"],
    ["@rollup/plugin-node-resolve"],
    {
      mainFields: ["module", "exports", "es", "es6", "esm", "main"],
      extensions: [".ts", ".js", ".coffee", ".tsx", ".jsx", ".mjs", ".node", ".json"],
      preferBuiltins: true,
      dedupe: [],
    },
    true
  )

  // so Rollup can convert externals to an ES module
  pushPlugin(
    ["commonjs"],
    ["@rollup/plugin-commonjs"],
    {
      transformMixedEsModules: true,
    },
    true
  )

  // replace
  pushPlugin(
    ["replace"],
    ["@rollup/plugin-replace"],
    {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    true
  )

  // terser
  pushPlugin(
    ["terser"],
    ["rollup-plugin-terser", "terser"],
    process.env.NODE_ENV === "production"
      ? {
          ecma: 2018,
          warnings: true,
          compress: {
            drop_console: false,
          },
        }
      : {},
    process.env.NODE_ENV === "production"
  )

  // utility function that pushes a plugin
  function pushPlugin(
    nameTriggers: string[],
    [moduleName, prop]: [modulesname: string, prop?: string],
    pluginDefaultOptions: object = {},
    includeByDefault: boolean = false
  ) {
    const index = includesAny(inputPluginsNames, [...nameTriggers, moduleName])
    if (index !== null) {
      const modul = require(moduleName)
      const pluginFunction = typeof prop === "string" ? modul[prop] : modul
      if (typeof inputPluginsNames[index] === "string") {
        // plugin name only
        plugins.push(pluginFunction(pluginDefaultOptions))
      } else if (typeof inputPluginsNames[index][2] === "boolean" && inputPluginsNames[index][2] === true) {
        // plugin with options that override pluginDefaultOptions
        plugins.push(pluginFunction( {...pluginDefaultOptions, ...inputPluginsNames[index][1]}))
      } else {
        // plugin with options
        plugins.push(pluginFunction(inputPluginsNames[index][1]))
      }
    } else if (includeByDefault) {
      const modul = require(moduleName)
      const pluginFunction = typeof prop === "string" ? modul[prop] : modul
      plugins.push(pluginFunction(pluginDefaultOptions))
    }
  }

  return plugins
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
  }
}
