/* eslint-disable no-use-before-define */
import {
  NodeTypes,
  type Node,
  type RootNode,
  type ElementNode,
  type TextNode,
  type CommentNode,
  type SimpleExpressionNode,
  type InterpolationNode,
  type AttributeNode,
  type DirectiveNode,
  type ExpressionNode,
} from '@vue/compiler-core'

import {
  type SFCBlock,
  type SFCParseResult,
  type SFCScriptBlock,
  type SFCStyleBlock,
  type SFCTemplateBlock,
} from '@vue/compiler-sfc'

function serializeRoot(node: RootNode): string {
  const attrs = node.source.match(/<template(?<attrs>.*?)>/)?.groups?.attrs || ''

  return `<template${attrs}>${node.children.map(child => serializeTemplateItem(child)).join('')}</template>`
}

function serializeElement(node: ElementNode): string {
  const props = node.props.length > 0 ? ` ${node.props.map(prop => serializeTemplateItem(prop)).join(' ')}` : ''

  if (node.isSelfClosing) {
    return `<${node.tag}${props} />`
  } else {
    const children = node.children.map(child => serializeTemplateItem(child)).join('')

    return `<${node.tag}${props}>${children}</${node.tag}>`
  }
}

function serializeText(node: TextNode) {
  return node.content
}

function serializeComment(node: CommentNode) {
  return `<!--${node.content}-->`
}

function serializeSimpleExpression(node: SimpleExpressionNode) {
  return node.isStatic ? node.content : `${node.content}`
}

function serializeInterpolation(node: InterpolationNode): string {
  return `{{ ${serializeTemplateItem(node.content)} }}`
}

function serializeAttribute(node: AttributeNode): string {
  const value = node.value !== undefined ? `="${serializeTemplateItem(node.value)}"` : ''

  return `${node.name}${value}`
}

function serializeDirective(node: DirectiveNode): string {
  function serializeSimpleExpressionArg(arg: SimpleExpressionNode) {
    return arg.isStatic ? serializeTemplateItem(arg) : `[${serializeTemplateItem(arg)}]`
  }

  function serializeArg(arg: ExpressionNode) {
    switch (arg.type) {
      case NodeTypes.SIMPLE_EXPRESSION:
        return serializeSimpleExpressionArg(arg as SimpleExpressionNode)
      default:
        console.log(JSON.stringify(node, null, 2))
        throw new Error(`Unknown arg type: ${arg.type}`)
    }
  }

  const arg = node.arg ? `:${serializeArg(node.arg)}` : ''
  const modifiers = node.modifiers.length > 0 ? `.${node.modifiers.join('.')}` : ''
  const exp = node.exp ? `="${serializeTemplateItem(node.exp)}"` : ''

  return `v-${node.name}${arg}${modifiers}${exp}`
}

/* eslint-disable complexity */
function serializeTemplateItem(node: Node) {
  switch (node.type) {
    case NodeTypes.ROOT:
      return serializeRoot(node as RootNode)
    case NodeTypes.ELEMENT:
      return serializeElement(node as ElementNode)
    case NodeTypes.TEXT:
      return serializeText(node as TextNode)
    case NodeTypes.COMMENT:
      return serializeComment(node as CommentNode)
    case NodeTypes.SIMPLE_EXPRESSION:
      return serializeSimpleExpression(node as SimpleExpressionNode)
    case NodeTypes.INTERPOLATION:
      return serializeInterpolation(node as InterpolationNode)
    case NodeTypes.ATTRIBUTE:
      return serializeAttribute(node as AttributeNode)
    case NodeTypes.DIRECTIVE:
      return serializeDirective(node as DirectiveNode)
    default:
      console.log(JSON.stringify(node, null, 2))
      throw new Error(`Unknown node type: ${node.type}`)
  }
}

/**
 * Serialize <template> section
 */
export function serializeTemplate(template: SFCTemplateBlock) {
  return template.ast ? serializeTemplateItem(template.ast) : ''
}

/**
 * Serialize <script> section.
 * This can be either ast.descriptor.script or ast.descriptor.scriptSetup
 */
export function serializeScript(script: SFCScriptBlock) {
  const lang = script.lang ? ` lang="${script.lang}"` : ''
  const setup = script.setup ? ` setup` : ''

  const attrs = structuredClone(script.attrs)
  delete attrs.lang
  delete attrs.setup
  const rest = Object.entries(attrs).map(([name, value]) => `${name}="${value}"`).join(' ')
  const restStr = rest ? ` ${rest}` : ''

  return `<script${lang}${setup}${restStr}>${script.content}</script>`
}

/**
 * Serialize <style> section
 */
export function serializeStyle(style: SFCStyleBlock) {
  const lang = style.lang ? ` lang="${style.lang}"` : ''
  const scoped = style.scoped ? ` scoped` : ''

  const attrs = structuredClone(style.attrs)
  delete attrs.lang
  delete attrs.scoped
  const rest = Object.entries(attrs).map(([name, value]) => `${name}="${value}"`).join(' ')
  const restStr = rest ? ` ${rest}` : ''

  return `<style${lang}${scoped}${restStr}>${style.content}</style>`
}

/**
 * Serialize <style> blocks.
 * This is to serialize ast.descriptor.styles
 */
export function serializeStyles(styles: SFCStyleBlock[]) {
  return styles.map(style => serializeStyle(style)).join('')
}

/**
 * Serialize non-standard block, like <i18n>
 * This is to serialize ast.descriptor.customBlocks
 */
export function serializeCustomBlock(block: SFCBlock) {
  // const lang = block.lang ? ` lang="${block.lang}"` : ''

  const attrs = Object.entries(block.attrs).map(([name, value]) => `${name}="${value}"`).join(' ')
  const attrsStr = attrs ? ` ${attrs}` : ''
  console.log('block:', block)

  return `<${block.type}${attrsStr}>${block.content}</${block.type}>`
}

/**
 * Serialize non-standard blocks, like <i18n>
 */
export function serializeCustomBlocks(blocks: SFCBlock[]) {
  return blocks.map(block => serializeCustomBlock(block))
}

/**
 * Serialize SFCParseResult.
 *
 * To use it first call the `parse` from @vue/compiler-sfc and pass
 * the result of parsing to this function.
 */
export function stringify(ast: SFCParseResult) {
  const template = ast.descriptor.template ? serializeTemplate(ast.descriptor.template) : ''
  const script = ast.descriptor.script ? serializeScript(ast.descriptor.script) : ''
  const setup = ast.descriptor.scriptSetup ? serializeScript(ast.descriptor.scriptSetup) : ''
  const style = serializeStyles(ast.descriptor.styles)
  const blocks = serializeCustomBlocks(ast.descriptor.customBlocks)

  return [template, script, setup, style, ...blocks].join('')
}
