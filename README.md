# Vue.js single file component (SFC) AST serializer

This library implements a serializer/stringifier for Vue.js SFC AST.

The main driver to implement something like that is to be able to add cross-cutting concerns to Vue through a Vite plugin

## Usage:

First you need to install a few dependencies:

```
npm install @vue/compiler-sfc @vue/compiler-core @padcom/vue-ast-serializer
```

Then you can parse and serialize the content like so:

```typescript
import { parse } from '@vue/compiler-sfc'
import { stringify } from '@padcom/vue-ast-serializer'

const code = '<template></template><i18n x="1">{ "de": { "hello": "Guten Tag!" } }</i18n>'

console.log(stringify(parse(code)))
```

## Example Vite plugin

The skeleton of a simple Vite plugin is, well.. simple:

```typescript
function example() {
  return {
    name: 'example',
    transform(code, id) {
      if (!id.includes('node_modules') && id.endsWith('.vue')) {
        const parsed = parse(code)
        const transformed = transform(parsed) // this you need to implement

        return stringify(result)
      } else {
        return code
      }
    },
  },
}
```

## API

### `function stringify(ast: SFCParseResult): string`

This function takes the result of a call to `parse` and returns a stringified version of it

### `function serializeTemplate(template: SFCTemplateBlock): string`

This function takes the AST of a template block and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.

### `function serializeScript(script: SFCScriptBlock): string`

This function takes the AST of a script block and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.

### `function serializeStyle(style: SFCStyleBlock): string`

This function takes the AST of a style block and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.

### `function serializeStyles(styles: SFCStyleBlock[]): string`

This function takes the AST of style blocks and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.

### `function serializeCustomBlock(block: SFCBlock): string`

This function takes the AST of a custom block (like `<i18n>`) and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.

### `function serializeCustomBlocks(blocks: SFCBlock[]): string`

This function takes the AST of custom blocks (like `<i18n>`) and returns a string.
Since this block is not parsed in any way by the `parse()` function from `@vue/compuler-sfc` it is just re-created as-is.
