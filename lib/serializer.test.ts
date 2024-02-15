import { describe, it, expect } from 'vitest'

import { parse } from '@vue/compiler-sfc'
import { stringify } from '..'

function verify(code: string, expected: string = code) {
  const ast = parse(code)
  const actual = stringify(ast)
  expect(actual).toBe(expected)
}

/* eslint-disable-next-line max-lines-per-function */
describe('VUE SFC serialization', () => {
  it('will serialize simple template', () => {
    verify('<template></template>')
  })

  it('will serialize self closing tag', () => {
    verify('<template><div /></template>')
  })

  it('will serialize static directive', () => {
    verify(
      '<template><div :a.b:c="d" /></template>',
      '<template><div v-bind:a.b:c="d" /></template>',
    )
  })

  it('will serialize dynamic directive', () => {
    verify(
      '<template><div @[a].b:c="d" /></template>',
      '<template><div v-on:[a].b:c="d" /></template>',
    )
  })

  it('will serialize static directive without expression', () => {
    verify('<template><div v-show /></template>')
  })

  it('will serialize attribute without value', () => {
    verify('<template><div alt /></template>')
  })

  it('will serialize attribute with value', () => {
    verify('<template><div alt="hello" /></template>')
  })

  it('will serialize interpolation', () => {
    verify('<template>{{ hello }}</template>')
  })

  it('will serialize comment', () => {
    verify('<template><!-- hello! --></template>')
  })

  it('will serialize v-if', () => {
    verify('<template><div v-if="test">hello</div></template>')
  })

  it('will serialize children', () => {
    verify('<template><div v-if="test"><span>hello</span><span class="test">world</span></div></template>')
  })

  it('will serialize multiple root elements', () => {
    verify('<template><div v-if="test" /><span v-else-if="test2">hello</span><span v-else class="test">world</span></template>')
  })

  it('will serialize bound classes', () => {
    verify(
      '<template><div :class="{ x: a > 0, [y]: true }" /></template>',
      '<template><div v-bind:class="{ x: a > 0, [y]: true }" /></template>',
    )
  })

  it('will serialize bound styles', () => {
    verify(
      '<template><div :style="{ x: a > 0, [y]: true }" /></template>',
      '<template><div v-bind:style="{ x: a > 0, [y]: true }" /></template>',
    )
  })

  it('will serialize template with attributes', () => {
    verify('<template lang="pug"></template>')
  })

  it('will serialize template with styles with attributes', () => {
    verify('<template lang="pug" x="1"></template><style lang="postcss" scoped>.test { me: 1px }</style>')
  })

  it('will serialize template with script with attributes', () => {
    verify(`<template></template><script lang="ts">console.log('Here!')</script>`)
  })

  it('will serialize template with setup script with attributes', () => {
    verify(`<template></template><script lang="ts" setup>console.log('Here!')</script>`)
  })

  it('will serialize template with custom blocks with attributes', () => {
    verify(`<template></template><i18n x="1">{ "de": { "hello": "Guten Tag!" } }</i18n>`)
  })
})
