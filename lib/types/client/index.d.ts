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
import type { Context } from '@deepseek-ai/cordis';
import { type PrefaceLocaleKey } from './locales.ts';
export type { PrefaceCardProps } from './preface-card.tsx';
export type { PrefaceLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The preface-context settings card copy. */
        'settings.preface-context': PrefaceLocaleKey;
    }
}
/**
 * Required services (cordis fiber inject). `settingsScope` is provided by the
 * ui-settings base plugin; `locale` by the locale plugin; `slots` is the
 * composition root. The target slot is declared by ui-settings-plugins'
 * `configurable` tab, whose activation order relative to this one is
 * unconstrained; registration depends on the slot through `slots.inject()`.
 */
export declare const inject: string[];
/**
 * Register the preface-context card once the `settings.plugin.item`
 * declaration is on the ledger, wire its controller to the settings scope,
 * and keep it fresh on every pushed invalidation.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
