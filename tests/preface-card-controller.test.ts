/**
 * Unit tests for the preface-context card controller
 * (`PrefaceCardController`, src/client/preface-card-controller.ts).
 *
 * The controller is a pure state machine over a bound `ConfigForm`; these
 * tests drive it with an in-memory stub scope (no wire, no React) and assert
 * the staged-edit / save / discard / reset semantics that the card renders.
 */

import { describe, expect, it, vi } from 'vitest'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { PrefaceCardController } from '../src/client/preface-card-controller.ts'
import type { PrefaceConfig } from '../src/config.ts'

/** A minimal in-memory ConfigForm stub for controller testing. */
function stubScope(initial: PrefaceConfig, base: Partial<PrefaceConfig> = initial): ConfigForm<Record<string, unknown>> {
  let value: Record<string, unknown> = { ...initial }
  let user: Record<string, unknown> | undefined = undefined
  const listeners = new Set<() => void>()
  const snapshot = (): ConfigFormSnapshot<Record<string, unknown>> => ({
    status: 'ready',
    value,
    base,
    user,
    revision: 0,
    writable: true,
    mode: 'host',
  })
  return {
    getSnapshot: snapshot,
    subscribe: (cb: () => void) => {
      listeners.add(cb)
      return () => { listeners.delete(cb) }
    },
    mutate: async () => true,
    set: async (field: string, valueArg: unknown) => {
      value = { ...value, [field]: valueArg }
      user = { ...(user ?? {}), [field]: valueArg }
      for (const cb of listeners) cb()
      return true
    },
    unset: async (field: string) => {
      const next = { ...value }
      delete (next as Record<string, unknown>)[field]
      value = next
      if (user !== undefined) {
        const nextUser = { ...user }
        delete nextUser[field]
        user = Object.keys(nextUser).length === 0 ? undefined : nextUser
      }
      for (const cb of listeners) cb()
      return true
    },
  }
}

describe('PrefaceCardController initial projection', () => {
  it('projects the scope value as draft text', () => {
    const scope = stubScope({ enabled: true, contextText: 'hello' })
    const controller = new PrefaceCardController(scope)
    const state = controller.snapshot.getSnapshot()
    expect(state.available).toBe(true)
    expect(state.writable).toBe(true)
    expect(state.dirty).toBe(false)
    expect(state.enabled.text).toBe('true')
    expect(state.contextText.text).toBe('hello')
  })

  it('marks a field overridden when the user layer carries it', () => {
    const scope = stubScope({ enabled: true, contextText: 'x' })
    // Seed a user layer entry on contextText.
    void scope.set('contextText', 'x')
    const controller = new PrefaceCardController(scope)
    const state = controller.snapshot.getSnapshot()
    expect(state.contextText.overridden).toBe(true)
  })
})

describe('edit staging', () => {
  it('stages contextText draft and marks the form dirty', () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('contextText', 'new text')
    const state = controller.snapshot.getSnapshot()
    expect(state.dirty).toBe(true)
    expect(state.contextText.text).toBe('new text')
  })

  it('stages enabled toggle as true/false string', () => {
    const scope = stubScope({ enabled: false, contextText: '' })
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('enabled', 'true')
    expect(controller.snapshot.getSnapshot().enabled.text).toBe('true')
  })
})

describe('resetField', () => {
  it('stages a clear that resets to the base value', () => {
    const scope = stubScope({ enabled: true, contextText: 'override' }, { enabled: true, contextText: 'base' })
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.resetField('contextText')
    const state = controller.snapshot.getSnapshot()
    expect(state.dirty).toBe(true)
    expect(state.contextText.text).toBe('base')
  })
})

describe('save', () => {
  it('writes staged edits through the scope and clears the dirty flag', async () => {
    const scope = stubScope({ enabled: false, contextText: '' })
    const setSpy = vi.spyOn(scope, 'set')
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('contextText', 'saved text')
    await new Promise((resolve) => { actions.save(); setTimeout(resolve, 0) })
    expect(setSpy).toHaveBeenCalledWith('contextText', 'saved text')
    const state = controller.snapshot.getSnapshot()
    expect(state.dirty).toBe(false)
    expect(state.contextText.text).toBe('saved text')
  })

  it('clears a field when resetField staged a clear', async () => {
    const scope = stubScope({ enabled: true, contextText: 'current' }, { enabled: true, contextText: 'base' })
    const unsetSpy = vi.spyOn(scope, 'unset')
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.resetField('contextText')
    await new Promise((resolve) => { actions.save(); setTimeout(resolve, 0) })
    expect(unsetSpy).toHaveBeenCalledWith('contextText')
  })

  it('marks failed when a write throws', async () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    vi.spyOn(scope, 'set').mockRejectedValue(new Error('write failed'))
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('contextText', 'x')
    await new Promise((resolve) => { actions.save(); setTimeout(resolve, 0) })
    expect(controller.snapshot.getSnapshot().failed).toBe(true)
  })

  it('marks failed when the Host refuses a write (resolves false)', async () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    vi.spyOn(scope, 'set').mockResolvedValue(false)
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('contextText', 'x')
    await new Promise((resolve) => { actions.save(); setTimeout(resolve, 0) })
    const state = controller.snapshot.getSnapshot()
    expect(state.failed).toBe(true)
    // A refused write keeps the draft so the user can correct it.
    expect(state.contextText.text).toBe('x')
  })
})

describe('discard', () => {
  it('drops all staged edits and clears the dirty flag', () => {
    const scope = stubScope({ enabled: true, contextText: 'orig' })
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    actions.edit('contextText', 'staged')
    expect(controller.snapshot.getSnapshot().dirty).toBe(true)
    actions.discard()
    const state = controller.snapshot.getSnapshot()
    expect(state.dirty).toBe(false)
    expect(state.contextText.text).toBe('orig')
  })
})
