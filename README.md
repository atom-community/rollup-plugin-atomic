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
as
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
