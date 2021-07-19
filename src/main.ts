import { includesAny, getPluginFunction } from "./utils"

import type resolve from "@rollup/plugin-node-resolve"
type RollupResolveOptions = Parameters<typeof resolve>[0]
import type commonjs from "@rollup/plugin-commonjs"
type RollupCommonjsOptions = Parameters<typeof commonjs>[0]
import type { terser } from "rollup-plugin-terser"
type RollupTerserOptions = Parameters<typeof terser>[0]
import type sourcemaps from "rollup-plugin-sourcemaps"
type RollupSourcemapsOptions = Parameters<typeof sourcemaps>[0]
import type replace from "@rollup/plugin-replace"
type RollupReplaceOptions = Parameters<typeof replace>[0]
// @ts-ignore
import type autoExternal from "rollup-plugin-auto-external"
type RollupAutoexternalOptions = Parameters<typeof autoExternal>[0] & Record<string, any>
import type typescript from "@rollup/plugin-typescript"
type RollupTypeScriptOptions = Parameters<typeof typescript>[0]
// @ts-ignore
import type coffeescript from "rollup-plugin-coffee-script"
type RollupCoffeeOptions = Parameters<typeof coffeescript>[0] & Record<string, any>
import type json from "@rollup/plugin-json"
type RollupJsonOptions = Parameters<typeof json>[0]
// @ts-ignore
import type cssOnly from "rollup-plugin-css-only"
type RollupCssonlyOptions = Parameters<typeof cssOnly>[0] & Record<string, any>
import type babel from "@rollup/plugin-babel"
type RollupBabelOptions = Parameters<typeof babel>[0]
import type { wasm } from "@rollup/plugin-wasm"
type RollupWasmOptions = Parameters<typeof wasm>[0]
// @ts-ignore
import type { asc } from "rollup-plugin-assemblyscript"
type RollupAscOptions = Parameters<typeof asc>[0] & Record<string, any>
import type visualizer from "rollup-plugin-visualizer"
type RollupVisualizerOptions = Parameters<typeof visualizer>[0]

import { existsSync } from "fs"
import { join } from "path"

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
  | "autoExternal"
  | "visualizer"
  | ["ts", RollupTypeScriptOptions, boolean?]
  | ["babel", RollupBabelOptions, boolean?]
  | ["coffee", RollupCoffeeOptions, boolean?]
  | ["json", RollupJsonOptions, boolean?]
  | ["css", RollupCssonlyOptions, boolean?]
  | ["wasm", RollupWasmOptions, boolean?]
  | ["as", RollupAscOptions, boolean?]
  | ["terser", RollupTerserOptions, boolean?]
  | ["replace", RollupReplaceOptions, boolean?]
  | ["sourcemaps", RollupSourcemapsOptions, boolean?]
  | ["commonjs", RollupCommonjsOptions, boolean?]
  | ["resolve", RollupResolveOptions, boolean?]
  | ["autoExternal", RollupAutoexternalOptions, boolean?]
  | ["visualizer", RollupVisualizerOptions, boolean?]

export function createPlugins(
  inputPluginsNames: Array<Plugin> = ["ts", "js", "json", "coffee"],
  extraPlugins?: Array<any>
) {
  const configDir = require.main?.filename?.replace(/node_modules.*/, "")

  let plugins = []

  // language specific

  // typescript
  pushPlugin(["ts", ".ts", "typescript", "TypeScript"], ["@rollup/plugin-typescript"], {
    noEmitOnError: false,
    module: "ESNext", // do not modify the imports
  } as RollupTypeScriptOptions)

  // coffeescript
  pushPlugin(
    ["coffee", ".coffee", "coffeescript", "coffee-script", "CoffeeScript", "cs"],
    ["rollup-plugin-coffee-script"]
  )

  // json
  pushPlugin(["json", ".json", "JSON"], ["@rollup/plugin-json"], { compact: true } as RollupJsonOptions)

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
      plugins.push(cssOnly({ output: "dist/bundle.css" } as RollupCssonlyOptions))
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
  } as RollupBabelOptions)

  // wasm
  pushPlugin(["wasm", "WebAssembly"], ["@rollup/plugin-wasm", "wasm"])

  // as
  pushPlugin(["as", "asc", "assemblyscript", "AssemblyScript"], ["rollup-plugin-assemblyscript", "asc"])

  // visualizer
  pushPlugin(["visualizer", "plot"], ["rollup-plugin-visualizer"], {
    sourcemap: true,
    open: true,
  } as RollupVisualizerOptions)

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
  pushPlugin(["sourcemaps"], ["rollup-plugin-sourcemaps"], {} as RollupSourcemapsOptions, true)

  pushPlugin(
    ["autoExternal"],
    ["rollup-plugin-auto-external"],
    {
      builtins: true,
      dependencies: false,
      peerDependencies: false,
    } as RollupAutoexternalOptions,
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
      preventAssignment: true,
    },
    true
  )

  // terser
  let terserOptions = (
    process.env.NODE_ENV === "production"
      ? {
          ecma: 2018,
          warnings: true,
          compress: {
            drop_console: false,
          },
          format: {
            comments: false,
          },
        }
      : {}
  ) as RollupTerserOptions
  if (typeof configDir === "string") {
    const terserConfigFile = join(configDir, ".terserrc.js")
    if (existsSync(terserConfigFile)) {
      const loadedTerserConfigFile = require(terserConfigFile) as { default: RollupTerserOptions } | RollupTerserOptions
      if (loadedTerserConfigFile !== undefined) {
        if ("default" in loadedTerserConfigFile) {
          terserOptions = loadedTerserConfigFile.default
        } else {
          terserOptions = loadedTerserConfigFile
        }
      }
    }
  }
  pushPlugin(["terser"], ["rollup-plugin-terser", "terser"], terserOptions, process.env.NODE_ENV === "production")

  // utility function that pushes a plugin
  function pushPlugin(
    nameTriggers: string[],
    [moduleName, prop]: [modulesname: string, prop?: string],
    pluginDefaultOptions: object = {},
    includeByDefault: boolean = false
  ) {
    const index = includesAny(inputPluginsNames, [...nameTriggers, moduleName])
    if (index !== null) {
      const pluginFunction = getPluginFunction(require(moduleName), prop)
      if (typeof inputPluginsNames[index] === "string") {
        // plugin name only
        plugins.push(pluginFunction(pluginDefaultOptions))
      } else if (typeof inputPluginsNames[index][2] === "boolean" && inputPluginsNames[index][2] === true) {
        // plugin with options that override pluginDefaultOptions
        const pluginOptions = inputPluginsNames[index][1]
        plugins.push(
          pluginFunction(
            typeof pluginOptions === "object"
              ? { ...pluginDefaultOptions, ...pluginOptions }
              : { ...pluginDefaultOptions, pluginOptions }
          )
        )
      } else {
        // plugin with options
        plugins.push(pluginFunction(inputPluginsNames[index][1]))
      }
    } else if (includeByDefault) {
      const pluginFunction = getPluginFunction(require(moduleName), prop)
      plugins.push(pluginFunction(pluginDefaultOptions))
    }
  }

  return plugins
}

/** @deprecated Use default Rollup syntax - this function will be removed in the next major version */
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
