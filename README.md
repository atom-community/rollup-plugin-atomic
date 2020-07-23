# rollup-plugin-atomic

Rollup plugin used in atom-ide-community

## Installation

```
npm install --save-dev rollup-plugin-atomic
```

You should also install the peer dependencies:

```
"rollup": "2.21.0",
```

and the following (only those that you use are needed):

```
"typescript": "^3.9.6",
"coffeescript": "^1.12.7",
"@babel/core": "^7.10.5",
```

## Usage

Create a `rollup.config.js` file at the root of the project with the following content. See API section for more details

```js
const { createPlugins } = require("rollup-plugin-atomic");

const plugins = createPlugins(["ts", "babel"]);

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
};
```

## API

### createPlugins

use `createPlugins` to create the plugins you need.

```ts
createPlugins(
  inputPlugins: Array<Plugin> = ["ts", "babel", "json", "coffee"], // languages/plugins you use
  extraPlugins?: Array<any>	// pass any extra plugins functions like `multientry()`
)
```

which `inputPlugins` is among these:

```
ts
babel
coffee
json
css
(js is considered by default)
```

You can pass an input plugin with their supported option:

```js
createPlugins(["ts", {noEmitOnError: false, tsconfig: "./lib/tsconfig.json"})
```

For adding extra plugins, you can:
```ts
import multyentry from '@rollup/plugin-multi-entry'
createPlugins(["ts", multyentry())
```

### createConfig

You can use `createConfig` to create the configs you need. This is a simple wrapper around the rollup config.

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
const { createPlugins, createConfig } = require("rollup-plugin-atomic");

const plugins = createPlugins(["ts", "babel"]);

const config = createConfig(
  "src/main.ts",
  "dist",
  "cjs",
  ["atom", "electron", "node-pty-prebuilt-multiarch"],
  plugins
);

module.exports = config;
```

You can create multiple configs using `createConfig` and export them as an array:

```js
module.exports = [config1, config2];
```
