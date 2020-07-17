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
const { createPlugins, createConfig } = require("rollup-plugin-atomic");

const plugins = createPlugins(["ts", "js"], true);

const config = createConfig(
  "src/main.ts",
  "dist",
  "cjs",
  ["atom", "electron", "node-pty-prebuilt-multiarch"],
  plugins
);

module.exports = config;
```

## API

use `createPlugins` to create the plugins you need.

```ts
createPlugins(
  languages: Array<string> = ["ts", "js", "json", "coffee"], // languages you use
  babel: boolean = true,     // if you want to use babel
  extraPlugins?: Array<any>	// pass any extra plugins functions like `multientry()`
)
```

use `createConfig` to create the configs you need

```ts
createConfig(
  input: string | Array<string> = "src/main.ts", // bundle's input(s) file(s)
  output_dir: string = "dist",	// where the bundle is stored
  output_format = "cjs",  // output format (e.g. `cjs`, `es`, etc)
  externals: Array<string> = ["atom", "electron"], // libraries you want to be external
  plugins = createPlugins() // pass the plugins you created using `createPlugins()`
)
```
You can create multiple configs using `createConfig` and export them as an array:
```js
module.exports = [config1, config2]
```

## Only using createPlugins:

you can only use `createPlugins` and then export your config with the typical rollup style:
```js
const { createPlugins } = require("rollup-plugin-atomic");

const plugins = createPlugins(["ts", "js"], true);

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
