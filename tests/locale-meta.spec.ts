/**
 * Locale meta resource checks for the Plugins-page localization
 * (dsh 0.1.7-rc.1 app-boot `readPluginMeta`): `locale/<lang>.json`
 * files are read as exported resources without evaluating plugin code.
 *
 * Contract under test:
 * ① `locale/en.json` exists (the anchor; without it localization is skipped).
 * ② Every `locale/*.json` has a lowercase language-id filename and parses
 *    into non-empty `meta.title` / `meta.description` strings.
 * ③ `package.json` exports the whole `./locale/*.json` glob (a partial
 *    export surfaces as a metadata error) and packs `locale/`.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const localeDir = fileURLToPath(new URL('../locale/', import.meta.url))
const languageId = /^[a-z]{2,8}(?:-[a-z0-9]{1,8})*$/u

const files = readdirSync(localeDir).filter(name => name.endsWith('.json'))

function metaOf(name: string): { title: unknown; description: unknown } {
  const parsed: unknown = JSON.parse(readFileSync(localeDir + name, 'utf8'))
  expect(typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed), `${name} must be a JSON object`).toBe(true)
  const meta = (parsed as Record<string, unknown>).meta
  expect(typeof meta === 'object' && meta !== null && !Array.isArray(meta), `${name}: meta must be an object`).toBe(true)
  return meta as { title: unknown; description: unknown }
}

describe('locale meta resources', () => {
  it('anchors on en.json beside zh.json', () => {
    expect(files).toContain('en.json')
    expect(files).toContain('zh.json')
  })

  it('names every file as a lowercase language id', () => {
    expect(files.length).toBeGreaterThan(0)
    for (const name of files) {
      expect(languageId.test(name.slice(0, -5)), `${name} must use a language id filename`).toBe(true)
    }
  })

  it('carries non-empty meta.title and meta.description in every language', () => {
    for (const name of files) {
      const meta = metaOf(name)
      expect(meta.title, `${name}: meta.title must be a string`).toBeTypeOf('string')
      expect((meta.title as string).trim(), `${name}: meta.title must be non-empty`).not.toBe('')
      expect(meta.description, `${name}: meta.description must be a string`).toBeTypeOf('string')
      expect((meta.description as string).trim(), `${name}: meta.description must be non-empty`).not.toBe('')
    }
  })

  it('exports and packs the locale directory from package.json', () => {
    const manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../package.json', import.meta.url)), 'utf8')) as {
      exports?: Record<string, unknown>
      files?: unknown
    }
    expect(manifest.exports?.['./locale/*.json']).toBe('./locale/*.json')
    expect(Array.isArray(manifest.files), 'files must be an array').toBe(true)
    expect((manifest.files as unknown[]).includes('locale/'), 'files must include locale/').toBe(true)
  })
})
