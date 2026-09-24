# dsh-plugin-preface-context — Agent Guide

## Plugin overview

Bundle-style DSH plugin that injects a user-configured text block as model-visible instructions context at the start of every session. The text and an enable switch are editable on the bundle row's page in the Plugins manager.

The plugin is a **dual-half** plugin (host + client). The host half listens to `agent/created` and calls `agent.inject()` with a plugin-sourced `user/message`. The client half registers a card into the Plugins page's `plugins.row.config` slot.

## Key conventions

- **Bundle form**: `cordis.patch.yml` inserts one plugin row with `config` (the profile-owned Config values); `package.json` has `dsh.bundle.patch`. No source patches to DSH staging.
- **Dual-half**: host half (`src/index.ts`) has the `agent/created` hook + the own-page policy; client half (`src/client/`) has the configuration card.
- **Pre-built `lib/` strategy**: `lib/` is committed (not in `.gitignore`); no `prepare` script; `github:` install works out of the box. Required because the client half depends on `@deepseek-ai/dsh-client-*` private peer deps.
- **Profile-owned live Config (dsh 0.1.7-rc.1, `DSH-0.1.7-RC1-04`)**: there is no settings namespace and no `ctx.settings.register`. The editable fields are `.volatile()` fields of the plugin's own Cordis `Config` (`src/config.ts`), persisted per profile under the entry id `dsh-plugin-preface-context` in `cordis.patch.yml`. `apply` receives `PrefaceEntryConfig` (volatile references) and reads them with `.get()` on every `agent/created`, so a live edit reaches the running instance without a remount. `installPrefacePage` only calls `settings.configure({ auto: false }, ctx.fiber)` so the settings service does not auto-generate a generic page beside the plugin's own card.
- **Client transport is `configForms` (dsh 0.1.7-rc.1, `DSH-0.1.7-RC1-27`)**: `settingsScope`/`SettingsScope` are gone. The client injects `['slots', 'locale', 'configForms']`, binds the entry's shared `ConfigForm` through `ctx.configForms.get('dsh-plugin-preface-context')`, and registers while the Host serves it via `ctx.configForms.whileServed([...], ...)`. `set`/`unset` resolve to `Promise<boolean>` (Host acceptance).
- **Plugins page card (dsh 0.1.7-rc.1, `DSH-0.1.7-RC1-31`)**: `settings.plugin.item` is retired. The card registers into `plugins.row.config` keyed `@huanlin/dsh-plugin-preface-context#dsh-plugin-preface-context` (bundle package name `#` row id); it renders only the row page (`view: 'page'`) and the one-line `view: 'summary'`.
- **Client card is self-built**: the upstream `ui-settings-plugins` package's `PluginCard` / `CardForm` / `fields.tsx` are internal modules (not re-exported from the `/client` public face), so an external plugin cannot reuse them. The card chrome + form controller are reimplemented here (slim equivalents). Its multiline textarea and boolean switch cover behaviour the `SettingsForm` primitives cannot express.
- **Card styles are injected, not served**: the client loader never serves `.css` artifacts; `src/client/preface-card.css.ts` holds a template-string stylesheet installed as one `<style data-plugin-css>` tag at activation (prefixed `dsh-pfc-*` class names replace the former CSS-modules map, whose empty export left the card unstyled).
- **`bindSnapshotSelector` inlined**: `@deepseek-ai/dsh-client-ui-renderer` does not re-export `bindSnapshotSelector` from its public `/client` face; business plugins must provide their own copy (`src/client/bind-snapshot-selector.ts`). (Not used in production code currently — the renderer auto-binds `usePrefaceCard` from the `hooks.prefaceCard` store — but kept for completeness.)
- **No `./invariant`**: the plugin publishes no `./invariant` export — the `agent/created` listener is a cordis effect auto-disposed with the plugin fiber and the own-page policy rides its own conditional inject child, so there is no independent divergent observation; empty installers are invalid under the invariant rules.
- **Schemastery is the DSH fork**: the host Config imports `@deepseek-ai/schemastery` (not bare `schemastery`); only the fork carries `.volatile()` and interoperates with the Loader's volatile-config diff.
- **Dev-time resolution**: tsconfig `paths` + `node_modules/@deepseek-ai/*` junctions into the source checkout (created AFTER `pnpm install`; install with `--ignore-workspace --config.auto-install-peers=false`). Point them at a checkout of the target cohort (≥ `dsh-v0.1.7-rc.1`) — the local clone must be updated as the plugin moves forward.

## File responsibilities

| File | Role |
|------|------|
| `src/index.ts` | Host entry: `name`/`inject`/`Config`/`apply` + `agent/created` listener + `buildPrefaceMessage` + the `preface-context` message source kind |
| `src/config.ts` | Schemastery `Config` (`.volatile()` fields) + `PrefaceConfig`/`PrefaceEntryConfig` + `resolvePrefaceConfig` (strict unknown-key rejection) |
| `src/settings.ts` | `installPrefacePage`: the `settings.configure({ auto: false })` own-page policy |
| `src/client/index.ts` | Client entry: `inject = ['slots', 'locale', 'configForms']`, registers the `plugins.row.config` card |
| `src/client/preface-card.tsx` | The card component: flat always-expanded body (enable toggle + textarea + footer) on the row's own detail page |
| `src/client/preface-card-controller.ts` | `PrefaceCardController`: staged edit / save / discard / reset over `ConfigForm` |
| `src/client/preface-card.css.ts` | Card stylesheet + `<style data-plugin-css>` install/dispose |
| `src/client/bind-snapshot-selector.ts` | Inlined uSES bridge (upstream shim) |
| `src/client/locales.ts` | English + Chinese dictionaries |

## Commands

```sh
pnpm run typecheck    # tsc --noEmit (host + client)
pnpm test             # vitest run (37 tests)
pnpm run build        # tsdown + tsc → lib/index.js, lib/client.js
pnpm run bundle:client # tsdown only (skip tsc; for fast client rebuilds)
```

## Data flow

### Session creation injection

1. `agent/created` fires (create `'startup'`, resume, clear, or compact).
2. `apply` reads the live volatile Config: `config.enabled.get()` / `config.contextText.get()`.
3. `buildPrefaceMessage` returns `undefined` when `enabled === false` or `contextText.trim() === ''` (no injection).
4. Otherwise it builds `createUserMessage({ content: [{type:'text', text}], source: {kind: 'preface-context', form: 'instructions'} })`.
5. `agent.inject(message)` queues the message into the session inbox.
6. The first `agent/pre-step` claims it and includes it in the model request.

### Configuration card read/write

1. `ctx.configForms.get('dsh-plugin-preface-context')` returns the entry's shared `ConfigForm`.
2. The form reads from the settings describe mirror and writes through `settings.mutate` (serialized, revision-fenced).
3. `PrefaceCardController` stages edits locally and writes on save through `form.set(field, value)` / `form.unset(field)` (each resolves to Host acceptance).
