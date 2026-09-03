/**
 * Host-side `preface-context` settings namespace + live source wiring.
 *
 * The plugin-row config (the `entry` passed to the plugin's `apply`) is the
 * composition BASE of the `preface-context` settings namespace: when a dsh
 * settings service is mounted, its user layer is layered on top (schema
 * defaults → base → user layer) and the runtime reads the live resolved
 * value through the bridge's `source` thunk. Without a settings service the
 * conditional `ctx.inject(['settings'], ...)` child never activates and the
 * source is exactly the entry: behavior identical to a no-settings build.
 *
 * The namespace reaches the web configuration boundary directly: the
 * apiproxy `settings.mutate` / `settings.describe` RPCs accept any
 * registered namespace (no allowlist gate in current upstream dsh), so the
 * client card reads/writes through `ctx.settingsScope.bind({ namespace })`
 * — no gateway channel is needed.
 *
 * @module @huanlin/dsh-plugin-preface-context/settings
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SettingsScope } from '@deepseek-ai/dsh-settings'
import { Config } from './config.ts'
import type { PrefaceConfig } from './config.ts'

/** The `preface-context` settings namespace (registered when a settings service exists). */
export const PREFACE_SETTINGS_NAMESPACE = 'preface-context'

/**
 * Mirror of @deepseek-ai/dsh-settings' `isUnloading` guard (its
 * `installSettingsSection` skips source/listener work while the plugin fiber
 * is unloading or disposed). The library compares `ctx.fiber.state` against
 * `FiberState.DISPOSED` / `FiberState.UNLOADING`; the const enum is erased at
 * runtime, so the vendored numeric values (4 / 5) are mirrored here.
 */
function isUnloading(ctx: Context): boolean {
  const state = (ctx as unknown as { fiber?: { state?: number } }).fiber?.state
  return state === 4 || state === 5
}

/**
 * The live configuration source for the runtime.
 *
 * `source()` returns the composed config (schema defaults → plugin-row base
 * → settings user layer). `onChange` registers a callback that fires at
 * attach, on committed changes, and at detach back to the entry.
 */
export interface PrefaceSettingsBridge {
  /** Read the currently authoritative config. */
  source(): PrefaceConfig
  /** Register a change callback (fires at attach, on change, at detach). */
  onChange(callback: () => void): void
}

/**
 * Install the `preface-context` settings namespace and wire the live source.
 *
 * Mirrors the dsh `installSettingsSection` pattern. The registration rides a
 * conditional `ctx.inject(['settings'], ...)` child, so with no settings
 * service the source stays the entry config. Multi-fiber dedupe: the host
 * may compose several preface-context fibers, and `settings.register` fails
 * loud on a duplicate namespace — the catch lets the first registration own
 * the live namespace while later instances fall back to the entry source.
 * @param ctx - consumer plugin context owning the wiring.
 * @param entry - the composition entry config, used as `base`.
 * @returns the bridge the runtime and gateway read through.
 */
export function installPrefaceSettings(ctx: Context, entry: PrefaceConfig): PrefaceSettingsBridge {
  const listeners = new Set<() => void>()
  let source = (): PrefaceConfig => entry
  const notify = (): void => {
    for (const listener of [...listeners]) listener()
  }
  ctx.inject(['settings'], (sctx) => {
    let scope: SettingsScope<PrefaceConfig> | undefined
    try {
      scope = sctx.settings.register(PREFACE_SETTINGS_NAMESPACE, Config, { base: entry })
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes('already registered')) throw error
      ctx.logger('preface-context').debug('settings namespace already registered — entry-source fallback (multi-fiber dedupe)')
      return
    }
    source = () => scope!.get()
    sctx.effect(() => () => {
      if (isUnloading(ctx)) return
      source = () => entry
      notify()
    })
    notify()
    scope.watch(() => {
      if (isUnloading(ctx)) return
      notify()
    })
  })
  return {
    source: (): PrefaceConfig => source(),
    onChange: (callback: () => void): void => {
      listeners.add(callback)
    },
  }
}
