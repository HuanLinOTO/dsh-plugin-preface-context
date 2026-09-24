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
import { PrefaceCard } from "./preface-card.js";
import { installPrefaceCardStyles } from "./preface-card.css.js";
import { PrefaceCardController } from "./preface-card-controller.js";
import { en, zh } from "./locales.js";
/** Dictionary namespace owned by this plugin. */
const NS = 'settings.preface-context';
/**
 * Profile entry id the host composes this plugin under: the `id` of the row in
 * `cordis.patch.yml`. It is also the settings namespace the Host serves the
 * entry's config under, so it keys both `ctx.configForms.get` and the
 * `plugins.row.config` registration.
 */
const ENTRY_ID = 'dsh-plugin-preface-context';
/** `plugins.row.config` key: the bundle's package name `#` the row id. */
const ROW_KEY = `@huanlin/dsh-plugin-preface-context#${ENTRY_ID}`;
/**
 * Required services (cordis fiber inject). `configForms` is provided by the
 * ui-settings base plugin; `locale` by the locale plugin; `slots` is the
 * composition root. Registration is gated on the Host serving the entry's
 * config through `configForms.whileServed`.
 */
export const inject = ['slots', 'locale', 'configForms'];
/**
 * Register the preface-context card while the Host serves the entry's config,
 * wire its controller to the shared config form, and keep it fresh on every
 * pushed invalidation.
 * @param ctx - client root context.
 */
export function apply(ctx) {
    ctx.effect(installPrefaceCardStyles, 'preface-context: card styles');
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'preface-context: copy dictionaries');
    const controller = new PrefaceCardController(ctx.configForms.get(ENTRY_ID));
    ctx.effect(() => ctx.configForms.whileServed([ENTRY_ID], () => ctx.slots.inject('plugins.row.config', function* () {
        yield ctx.slots.register({
            name: 'plugins.row.config',
            key: ROW_KEY,
            locale: NS,
            inject: () => controller.inject(),
        }, PrefaceCard);
    })), 'preface-context: plugin page');
}
