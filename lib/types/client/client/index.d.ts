/**
 * Preface-context configuration page, browser half. Registers the
 * `preface-context` card into the Plugins page's `plugins.row.config` slot,
 * keyed by `<package>#<row id>`, so it appears while the bundle row is enabled
 * and the Host serves the entry's config.
 *
 * Since dsh 0.1.7-rc.1 the client settings transport is `ctx.configForms`
 * (`settingsScope` is gone): the controller binds the entry's shared
 * `ConfigForm` through `ctx.configForms.get(entryId)`, whose reads ride the
 * settings describe mirror and whose writes go through `settings.mutate`.
 *
 * Export discipline: value-imports ONLY the frozen platform module table
 * (React / cordis / ui-primitives); every other `@deepseek-ai/*` import is
 * type-only (erased at build) — values arrive via cordis injection
 * (`ctx.configForms` is the read/write channel).
 */
import type { Context } from '@deepseek-ai/cordis';
import { type PrefaceLocaleKey } from './locales.ts';
export type { PrefaceCardProps } from './preface-card.tsx';
export type { PrefaceLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** The preface-context configuration card copy. */
        'settings.preface-context': PrefaceLocaleKey;
    }
}
/**
 * Required services (cordis fiber inject). `configForms` is provided by the
 * ui-settings base plugin; `locale` by the locale plugin; `slots` is the
 * composition root. Registration is gated on the Host serving the entry's
 * config through `configForms.whileServed`.
 */
export declare const inject: string[];
/**
 * Register the preface-context card while the Host serves the entry's config,
 * wire its controller to the shared config form, and keep it fresh on every
 * pushed invalidation.
 * @param ctx - client root context.
 */
export declare function apply(ctx: Context): void;
