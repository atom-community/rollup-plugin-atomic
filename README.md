# rollup-plugin-atomic

Rollup plugin used in atom-ide-community

## Installation

```
npm install --save-dev rollup-plugin-atomic
```

You should also install the peer dependencies:

```
"rollup": "^2"
```

and the following (only those that you use are needed):

```
"typescript": "^4",
"coffeescript": "^1",
"@babel/core": "^7"
```

## Usage

Create a `rollup.config.js` file at the root of the project with the following content. See API section for more details

```js
const { createPlugins } = require("rollup-plugin-atomic")

const plugins = createPlugins(["ts", "babel"])

module.exports = {
  input: "src/main.ts",
  output: [
    {
      dir: "dist",
      format: "cjs",
      sourcemap: true,
    },
  ],
  plugins: plugins,
}
```

## API

### createPlugins

use `createPlugins` to create the plugins you need.

```ts
createPlugins(
  inputPlugins: Array<Plugin> = ["ts", "babel", "json", "coffee"], // languages/plugins you use
  extraPlugins?: Array<any>	// pass any extra plugins functions as an array like `[multientry()]`
)
```

which `inputPlugins` is among these:

```
js (considered by default)
ts
babel
coffee
json
css
wasm
visualizer
```

Default plugins configured automatically:

```
commonjs
resolve
autoExternal
sourcemaps
terser (in production)
replace (in production)
```

### Override Default Options for the plugins `[name, overriddenOptions, true]`

You can pass an input plugin with the overridden options using the `[name, overriddenOptions, true]` syntax.

```ts
const plugins = createPlugins([
  ["ts", { tsconfig: "./lib/tsconfig.json" }, true], // third element makes the config merge to and override the default options
  "js",
])
```

The difference with the next syntax is that these are merged into the default options and if there is a config with the same name, they override it, but the next syntax completely replaces the default options.

### Completely New Options for the plugins `[name, newOptions]`

You can pass an input plugin with their supported option using the `[name, newOptions]` syntax:

```ts
const plugins = createPlugins([
  ["ts", { tsconfig: "./lib/tsconfig.json", noEmitOnError: false, module: "ESNext" }],
  "js",
])
```

### Adding New Extra Plugins

For adding extra plugins, you can pass them in array to the second argument

```ts
import multyentry from "@rollup/plugin-multi-entry"
createPlugins(["ts"], [multyentry()])
```

---

### createConfig (not recommend)

This is a simple wrapper around the rollup config, so it is recommended to use the default Rollup syntax.

You can use `createConfig` to create the configs you need.

```ts
createConfig(
  input: string | Array<string> = "src/main.ts", // bundle's input(s) file(s)
  output_dir: string = "dist",	// where the bundle is stored
  output_format = "cjs",  // output format (e.g. `cjs`, `es`, etc)
  externals: Array<string> = ["atom", "electron"], // libraries you want to be external
  plugins = createPlugins() // pass the plugins you created using `createPlugins()`
)
```

An example that uses `createConfig`:

```js
const { createPlugins, createConfig } = require("rollup-plugin-atomic")

const plugins = createPlugins(["ts", "babel"])

const config = createConfig("src/main.ts", "dist", "cjs", ["atom", "electron", "node-pty-prebuilt-multiarch"], plugins)

module.exports = config
```

You can create multiple configs using `createConfig` and export them as an array:

```js
module.exports = [config1, config2]
```
