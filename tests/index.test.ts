/**
 * Unit tests for the preface-context host entry (`buildPrefaceMessage` and the
 * `agent/created` wiring, src/index.ts).
 *
 * `agent/created` dispatch itself is a one-liner over a cordis event; what is
 * worth testing is the decision function that gates injection (disabled config,
 * empty text, message shape) and that the listener reads the LIVE volatile
 * config references at each event.
 */

import { describe, expect, it, vi } from 'vitest'
import { apply, buildPrefaceMessage } from '../src/index.ts'
import type { PrefaceConfig, PrefaceEntryConfig } from '../src/config.ts'

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

  it('tags the message as this plugin producer with the instructions form', () => {
    const message = buildPrefaceMessage(config({ contextText: 'preface' }))
    expect(message!.source).toEqual({
      kind: 'preface-context',
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

describe('apply agent/created wiring', () => {
  /** A context stub capturing the plugin's `agent/created` listener. */
  function stubContext() {
    const listeners: Array<(payload: { agent: { inject: (message: unknown) => void } }) => void> = []
    const ctx = {
      inject: () => ({ dispose: () => {} }),
      on: (_event: string, listener: (payload: never) => void) => {
        listeners.push(listener as never)
        return () => {}
      },
    }
    return { ctx, listeners }
  }

  it('subscribes to agent/created and injects on creation', () => {
    const { ctx, listeners } = stubContext()
    const inject = vi.fn()
    apply(ctx as never, { enabled: { get: () => true }, contextText: { get: () => 'live' } } as unknown as PrefaceEntryConfig)
    expect(listeners.length).toBe(1)
    listeners[0]!({ agent: { inject } })
    expect(inject).toHaveBeenCalledTimes(1)
    expect(inject.mock.calls[0]![0]).toMatchObject({ role: 'user' })
  })

  it('reads the live volatile references on every event', () => {
    const { ctx, listeners } = stubContext()
    const inject = vi.fn()
    let enabled = true
    let text = 'live'
    apply(ctx as never, { enabled: { get: () => enabled }, contextText: { get: () => text } } as unknown as PrefaceEntryConfig)

    listeners[0]!({ agent: { inject } })
    expect(inject).toHaveBeenCalledTimes(1)

    // A profile edit flips the switch: the next creation injects nothing.
    enabled = false
    listeners[0]!({ agent: { inject } })
    expect(inject).toHaveBeenCalledTimes(1)

    // Re-enabled with empty text: still nothing.
    enabled = true
    text = ''
    listeners[0]!({ agent: { inject } })
    expect(inject).toHaveBeenCalledTimes(1)

    // Re-enabled with new text: the new value is read.
    text = 'changed'
    listeners[0]!({ agent: { inject } })
    expect(inject).toHaveBeenCalledTimes(2)
  })
})
