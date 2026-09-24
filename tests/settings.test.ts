/**
 * Unit tests for the preface-context host page wiring
 * (`installPrefacePage`, src/settings.ts).
 *
 * Contract under test:
 * ① No settings service (the conditional `ctx.inject(['settings'], ...)` child
 *    never activates) — `configure` is never called.
 * ② With a settings service — the child effect registers
 *    `settings.configure({ auto: false }, <the plugin's own fiber>)` exactly
 *    once, and the disposer the effect returns disposes the policy.
 */

import { describe, expect, it, vi } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import { installPrefacePage } from '../src/settings.ts'

/** A settings-service stub recording `configure` calls. */
function stubSettings() {
  const dispose = vi.fn()
  const configure = vi.fn(() => dispose)
  return { configure, dispose }
}

/**
 * A cordis-context stub: `inject` captures the conditional child callback so a
 * test can decide whether the settings service is available.
 */
function stubContext() {
  const fiber = { id: 'plugin-fiber' }
  const effects: Array<() => unknown> = []
  let child: ((sctx: unknown) => unknown) | undefined
  const ctx = {
    fiber,
    inject: (_names: readonly string[], callback: (sctx: unknown) => unknown) => {
      child = callback
      return { dispose: vi.fn() }
    },
    effect: (fn: () => unknown) => {
      effects.push(fn)
      return () => {}
    },
  }
  return {
    ctx: ctx as unknown as Context,
    fiber,
    /** Activate the conditional settings child with the given service. */
    activate: (settings: { configure: ReturnType<typeof stubSettings>['configure'] } | undefined) => {
      if (settings === undefined) return
      const childEffects: Array<() => unknown> = []
      child!({
        settings,
        effect: (fn: () => unknown) => {
          childEffects.push(fn)
          return () => {}
        },
      })
      return childEffects
    },
    hasChild: () => child !== undefined,
  }
}

describe('installPrefacePage without a settings service', () => {
  it('captures the conditional child but registers nothing', () => {
    const { ctx, hasChild, activate } = stubContext()
    installPrefacePage(ctx)
    expect(hasChild()).toBe(true)
    // The settings service never mounts: the child never runs.
    expect(activate(undefined)).toBeUndefined()
  })
})

describe('installPrefacePage with a settings service', () => {
  it('registers an auto:false page policy owned by the plugin fiber, disposed by the effect', () => {
    const { ctx, fiber, activate } = stubContext()
    installPrefacePage(ctx)
    const settings = stubSettings()
    const childEffects = activate(settings)!

    expect(childEffects.length).toBe(1)
    const disposer = childEffects[0]!()
    expect(settings.configure).toHaveBeenCalledTimes(1)
    expect(settings.configure).toHaveBeenCalledWith({ auto: false }, fiber)
    expect(settings.dispose).not.toHaveBeenCalled()
    ;(disposer as () => void)()
    expect(settings.dispose).toHaveBeenCalledTimes(1)
  })
})
