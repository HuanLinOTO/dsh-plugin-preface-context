/**
 * Unit tests for the preface-context Config schema.
 *
 * @module @huanlin/dsh-plugin-preface-context/tests/config.spec
 */
import { describe, expect, it } from 'vitest'
import { Config, resolvePrefaceConfig } from '../src/config.ts'
import type { PrefaceConfig } from '../src/config.ts'

describe('Config schema', () => {
  it('applies defaults for an empty object', () => {
    expect(resolvePrefaceConfig({})).toEqual({ enabled: true, contextText: '' })
  })

  it('preserves provided values', () => {
    expect(resolvePrefaceConfig({ enabled: false, contextText: 'hello' })).toEqual({
      enabled: false,
      contextText: 'hello',
    })
  })

  it('coerces missing enabled to the default true', () => {
    expect(resolvePrefaceConfig({ contextText: 'x' })).toEqual({ enabled: true, contextText: 'x' })
  })

  it('coerces missing contextText to the default empty string', () => {
    expect(resolvePrefaceConfig({ enabled: false })).toEqual({ enabled: false, contextText: '' })
  })

  it('rejects an unknown key (strict schema)', () => {
    expect(() => resolvePrefaceConfig({ enabled: true, contextText: '', bogus: 1 })).toThrow(/unknown config key "bogus"/)
  })

  it('rejects a non-boolean enabled', () => {
    expect(() => Config({ enabled: 'yes', contextText: '' })).toThrow()
  })

  it('rejects a non-string contextText', () => {
    expect(() => Config({ enabled: true, contextText: 42 })).toThrow()
  })

  it('accepts a multiline contextText verbatim (no trim)', () => {
    const text = 'line one\nline two\n  indented third'
    expect(resolvePrefaceConfig({ contextText: text }).contextText).toBe(text)
  })
})

describe('resolvePrefaceConfig', () => {
  it('returns a full PrefaceConfig with defaults applied', () => {
    const result = resolvePrefaceConfig({})
    expect(result).toEqual({ enabled: true, contextText: '' } satisfies PrefaceConfig)
  })

  it('does not mutate the input', () => {
    const input = { enabled: false }
    resolvePrefaceConfig(input)
    expect(input).toEqual({ enabled: false })
  })
})
