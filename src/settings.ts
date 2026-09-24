/**
 * Host-side page wiring for the preface-context plugin.
 *
 * Since dsh 0.1.7-rc.1 there is no separate settings namespace and no
 * `ctx.settings.register`: every configurable value lives in the plugin's own
 * Cordis Config (`src/config.ts`), persisted per profile under the entry id.
 * The settings service enumerates the entry's `.volatile()` fields for forms.
 *
 * The plugin ships its own configuration card (the client half registers it
 * into the Plugins page's `plugins.row.config` slot), so this only tells the
 * settings service not to auto-generate a generic page for the entry.
 *
 * @module @huanlin/dsh-plugin-preface-context/settings
 */

import type { Context } from '@deepseek-ai/cordis'
// Type-only: pulls the settings service's Context merge (`ctx.settings`).
import type {} from '@deepseek-ai/dsh-settings'

/**
 * Declare that the plugin ships its own configuration page.
 *
 * The registration rides a conditional `ctx.inject(['settings'], ...)` child,
 * so with no settings service mounted (a non-Web composition) nothing runs and
 * the plugin stays behaviorally identical. The owner passed to `configure` is
 * the plugin's own fiber, not the conditional child's, so the no-auto-page
 * policy follows the plugin instance.
 * @param ctx - the plugin's cordis context.
 */
export function installPrefacePage(ctx: Context): void {
  ctx.inject(['settings'], (sctx) => {
    sctx.effect(() => sctx.settings.configure({ auto: false }, ctx.fiber))
  })
}
