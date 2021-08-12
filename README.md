# rollup-plugin-atomic

Rollup plugin used in atom-ide-community

## Installation

```
npm install --save-dev rollup-plugin-atomic
```

<details>
<summary> You should have the peer dependencies. </summary>

If using `npm`, the bundled Rollup, TypeScript, Babel, etc is hoisted automatically.

If using `pnpm`, either add the following to your `.npmrc` to hoist the prettier bundled with the config

```
public-hoist-pattern[]=*
```

Or install these yourself in your `devDependencies`.

```
pnpm install -save-dev rollup
pnpm install --save-dev @babel/core typescript coffeescript assemblyscript  # whichever you need
```

</details>

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
createPlugins(inputPlugins: Array<Plugin> = ["ts", "babel", "json", "coffee"])
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

### Override Default Options for the plugins `[name, overriddenOptions]`

You can pass an input plugin with the overridden options using the `[name, overriddenOptions]` syntax.

```ts
const plugins = createPlugins([["ts", { tsconfig: "./lib/tsconfig.json" }], "js"])
```

### Completely New Options for the plugins `[name, newOptions, false]`

You can pass an input plugin with their supported option using the `[name, newOptions, false]` syntax:

```ts
const plugins = createPlugins([
  ["ts", { tsconfig: "./lib/tsconfig.json", noEmitOnError: false, module: "ESNext" }, false],
  "js",
])
```

Passing false as the third argument results in discarding the `rollup-config-atomic` built-in options.

### Adding New Extra Plugins

For adding extra plugins, you can simply concatenate your plugins with the output of `createPlugins`

```ts
import multyentry from "@rollup/plugin-multi-entry" // an extra plugin

const plugins = [...createPlugins(["ts"]), multyentry()]
```
