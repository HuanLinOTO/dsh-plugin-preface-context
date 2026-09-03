/**
 * Unit tests for the preface-context host entry's message builder
 * (`buildPrefaceMessage`, src/index.ts).
 *
 * The `agent/session-start` → `agent.inject()` wiring itself is a one-liner
 * over a cordis emit event; what is worth testing is the decision function
 * that gates injection: disabled config, empty text, and the message shape
 * when injection happens.
 */

import { describe, expect, it } from 'vitest'
import { buildPrefaceMessage } from '../src/index.ts'
import type { PrefaceConfig } from '../src/config.ts'

function config(overrides: Partial<PrefaceConfig> = {}): PrefaceConfig {
  return { enabled: true, contextText: '', ...overrides }
}

describe('buildPrefaceMessage', () => {
  it('returns undefined when enabled is false', () => {
    expect(buildPrefaceMessage(config({ enabled: false, contextText: 'hello' }))).toBeUndefined()
  })

  it('returns undefined when contextText is empty', () => {
    expect(buildPrefaceMessage(config({ contextText: '' }))).toBeUndefined()
  })

  it('returns undefined when contextText is whitespace-only', () => {
    expect(buildPrefaceMessage(config({ contextText: '   \n\t  ' }))).toBeUndefined()
  })

  it('returns a user message carrying the text when enabled and text is non-empty', () => {
    const message = buildPrefaceMessage(config({ contextText: 'You are a helpful assistant.' }))
    expect(message).toBeDefined()
    expect(message!.role).toBe('user')
    expect(message!.content).toEqual([{ type: 'text', text: 'You are a helpful assistant.' }])
  })

  it('tags the message as plugin-sourced instructions context', () => {
    const message = buildPrefaceMessage(config({ contextText: 'preface' }))
    expect(message!.source).toEqual({
      kind: 'plugin',
      plugin: 'dsh-plugin-preface-context',
      form: 'instructions',
    })
  })

  it('preserves the raw contextText (no trim) in the message content', () => {
    const text = '  line one\n  line two  '
    const message = buildPrefaceMessage(config({ contextText: text }))
    expect(message!.content).toEqual([{ type: 'text', text }])
  })

  it('has a stable id (frozen message)', () => {
    const message = buildPrefaceMessage(config({ contextText: 'x' }))
    expect(message!.id).toEqual(expect.any(String))
    expect(Object.isFrozen(message)).toBe(true)
  })
})
