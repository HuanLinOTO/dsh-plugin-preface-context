/**
 * Preface-context settings plugin, browser half. Registers the
 * `preface-context` card into the shell-declared `settings.plugin.item` slot
 * (the "插件配置" settings page), keyed by the `preface-context` settings
 * namespace. The card's controller binds the namespace through
 * `ctx.settingsScope.bind()`, which reads/writes through the standard
 * `settings.describe` / `settings.mutate` RPCs (the apiproxy accepts any
 * registered namespace — no allowlist gate on current upstream dsh).
 *
 * Export discipline: value-imports ONLY the frozen platform module table
 * (React / cordis / ui-primitives); every other `@deepseek-ai/*` import is
 * type-only (erased at build) — values arrive via cordis injection
 * (`ctx.settingsScope` is the read/write channel).
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the settings domain's ctx.settingsScope Context merge.
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
// Type-only: pulls the plugin-config card slot's SlotMap merge (the
// 'settings.plugin.item' keyed entry — this half's registration target).
import type {} from '@deepseek-ai/dsh-client-ui-settings-plugins/client'
// Type-only: pulls the renderer's ctx.slots Context merge (the composition
// root service; moved here from the deleted dsh-client-runtime).
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import { PrefaceCard } from './preface-card.tsx'
import type { PrefaceCardInjected } from './preface-card.tsx'
import { installPrefaceCardStyles } from './preface-card.css.ts'
import { PrefaceCardController } from './preface-card-controller.ts'
import { en, zh, type PrefaceLocaleKey } from './locales.ts'

export type { PrefaceCardProps } from './preface-card.tsx'
export type { PrefaceLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** The preface-context settings card copy. */
    'settings.preface-context': PrefaceLocaleKey
  }
}

/** Dictionary namespace owned by this plugin. */
const NS = 'settings.preface-context'

/** Settings namespace the host half registers (must match the host constant). */
const SETTINGS_NAMESPACE = 'preface-context'

/**
 * Required services (cordis fiber inject). `settingsScope` is provided by the
 * ui-settings base plugin; `locale` by the locale plugin; `slots` is the
 * composition root. The target slot is declared by ui-settings-plugins'
 * `configurable` tab, whose activation order relative to this one is
 * unconstrained; registration depends on the slot through `slots.inject()`.
 */
export const inject = ['slots', 'locale', 'settingsScope']

/**
 * Register the preface-context card once the `settings.plugin.item`
 * declaration is on the ledger, wire its controller to the settings scope,
 * and keep it fresh on every pushed invalidation.
 * @param ctx - client root context.
 */
export function apply(ctx: Context): void {
  ctx.effect(installPrefaceCardStyles, 'preface-context: card styles')

  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'preface-context: copy dictionaries')

  const settingsScope = ctx.settingsScope
  const controller = new PrefaceCardController(
    settingsScope.bind({ namespace: SETTINGS_NAMESPACE }),
  )

  ctx.slots.inject('settings.plugin.item', function* () {
    yield ctx.slots.register({
      name: 'settings.plugin.item',
      key: SETTINGS_NAMESPACE,
      locale: NS,
      inject: (): PrefaceCardInjected => controller.inject(),
    }, PrefaceCard)
  })
}
