/**
 * Unit tests for the preface-context settings bridge
 * (`installPrefaceSettings`, src/settings.ts).
 *
 * Contract under test:
 * ① No settings service (plain cordis ctx, no `settings` injection) — the
 *    source thunk falls back to the entry config, behavior identical to a
 *    no-settings build.
 * ② With a settings service mounted — the bridge registers the
 *    `preface-context` namespace: `describe` exposes it, the schema is the
 *    `Config` schema, the composition `base` is the entry config.
 * ③ A user-layer write (enabled/contextText) is reflected live in the
 *    source thunk: the composed value layers schema defaults → base → user.
 * ④ onChange fires at attach, on committed changes, and at detach.
 * ⑤ Multi-fiber dedupe: a second registration on the same namespace falls
 *    back to the entry source without throwing.
 */

import { describe, expect, it, vi } from 'vitest'
import { Context } from '@deepseek-ai/cordis'
import { MemorySettings } from './support/memory-settings'
import { PREFACE_SETTINGS_NAMESPACE, installPrefaceSettings } from '../src/settings.ts'
import { Config } from '../src/config.ts'
import type { PrefaceConfig } from '../src/config.ts'

/** Full entry (plugin-row) config shape, merged over the schema defaults. */
function entryConfig(overrides: Partial<PrefaceConfig> = {}): PrefaceConfig {
  return { enabled: true, contextText: '', ...overrides }
}

/** Wait until the conditional `ctx.inject(['settings'], ...)` child registered the namespace. */
async function waitRegistered(ctx: Context): Promise<void> {
  await vi.waitFor(() => {
    expect(ctx.settings.describe().some((d) => d.ns === PREFACE_SETTINGS_NAMESPACE)).toBe(true)
  })
}

// ---------------------------------------------------------------------------
// ① no settings service → entry fallback
// ---------------------------------------------------------------------------

describe('no settings service (entry fallback)', () => {
  it('bridge.source() is exactly the entry config', () => {
    const ctx = new Context()
    const entry = entryConfig({ enabled: false, contextText: 'hello' })
    const bridge = installPrefaceSettings(ctx, entry)
    expect(bridge.source()).toEqual(entry)
  })

  it('stays on the entry even after a tick (no settings service ever mounts)', async () => {
    const ctx = new Context()
    const entry = entryConfig()
    const bridge = installPrefaceSettings(ctx, entry)
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(bridge.source()).toEqual(entry)
  })
})

// ---------------------------------------------------------------------------
// ② registration visible via describe
// ---------------------------------------------------------------------------

describe('with a settings service mounted', () => {
  it('registers the preface-context namespace with the Config schema and entry as base', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry = entryConfig({ contextText: 'base text' })
    installPrefaceSettings(ctx, entry)
    await waitRegistered(ctx)
    const descriptor = ctx.settings.describe().find((d) => d.ns === PREFACE_SETTINGS_NAMESPACE)
    expect(descriptor).toBeDefined()
    expect(descriptor?.schema).toEqual(Config.toJSON())
    expect(descriptor?.base).toEqual({ enabled: true, contextText: 'base text' })
  })

  it('source() returns the composed value (base over schema defaults) with no user layer', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry = entryConfig({ enabled: false, contextText: 'base' })
    const bridge = installPrefaceSettings(ctx, entry)
    await waitRegistered(ctx)
    expect(bridge.source()).toEqual({ enabled: false, contextText: 'base' })
  })
})

// ---------------------------------------------------------------------------
// ③ live user-layer write reflected in source()
// ---------------------------------------------------------------------------

describe('live user-layer writes', () => {
  it('reflects a settings.update in bridge.source() (base → user layering)', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry = entryConfig({ enabled: true, contextText: 'base' })
    const bridge = installPrefaceSettings(ctx, entry)
    await waitRegistered(ctx)
    await ctx.settings.update(PREFACE_SETTINGS_NAMESPACE, { contextText: 'user override' })
    expect(bridge.source()).toEqual({ enabled: true, contextText: 'user override' })
  })

  it('keeps base defaults the user did not override', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry = entryConfig({ enabled: false, contextText: 'base' })
    const bridge = installPrefaceSettings(ctx, entry)
    await waitRegistered(ctx)
    // User overrides only `enabled`; `contextText` stays at the base value.
    await ctx.settings.update(PREFACE_SETTINGS_NAMESPACE, { enabled: true })
    expect(bridge.source()).toEqual({ enabled: true, contextText: 'base' })
  })

  it('replace({}) resets the user layer back to the base', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry = entryConfig({ enabled: false, contextText: 'base' })
    const bridge = installPrefaceSettings(ctx, entry)
    await waitRegistered(ctx)
    await ctx.settings.update(PREFACE_SETTINGS_NAMESPACE, { contextText: 'override' })
    expect(bridge.source().contextText).toBe('override')
    await ctx.settings.replace(PREFACE_SETTINGS_NAMESPACE, {})
    expect(bridge.source()).toEqual({ enabled: false, contextText: 'base' })
  })
})

// ---------------------------------------------------------------------------
// ④ onChange notification
// ---------------------------------------------------------------------------

describe('onChange notifications', () => {
  it('fires at attach (when the settings service mounts)', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const bridge = installPrefaceSettings(ctx, entryConfig())
    const cb = vi.fn()
    bridge.onChange(cb)
    await waitRegistered(ctx)
    expect(cb).toHaveBeenCalled()
  })

  it('fires on a committed settings change', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const bridge = installPrefaceSettings(ctx, entryConfig())
    const cb = vi.fn()
    bridge.onChange(cb)
    await waitRegistered(ctx)
    cb.mockClear()
    await ctx.settings.update(PREFACE_SETTINGS_NAMESPACE, { contextText: 'new' })
    expect(cb).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// ⑤ multi-fiber dedupe
// ---------------------------------------------------------------------------

describe('multi-fiber dedupe', () => {
  it('a second install on the same namespace falls back to entry source without throwing', async () => {
    const ctx = new Context()
    const settings = new MemorySettings(ctx)
    ctx.settings = settings
    const entry1 = entryConfig({ contextText: 'first' })
    const entry2 = entryConfig({ contextText: 'second' })
    const bridge1 = installPrefaceSettings(ctx, entry1)
    await waitRegistered(ctx)
    // The second install must not throw; its source stays on its own entry
    // (the first registration owns the live namespace).
    expect(() => installPrefaceSettings(ctx, entry2)).not.toThrow()
    const bridge2 = installPrefaceSettings(ctx, entry2)
    expect(bridge2.source()).toEqual(entry2)
    // The first bridge still reads the live composed value.
    expect(bridge1.source().contextText).toBe('first')
  })
})
