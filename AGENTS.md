# dsh-plugin-preface-context — Agent Guide

## Plugin overview

Bundle-style DSH plugin that injects a user-configured text block as model-visible instructions context at the start of every session. The text and an enable switch are editable on the "插件配置" settings page.

The plugin is a **dual-half** plugin (host + client). The host half listens to `agent/session-start` and calls `agent.inject()` with a plugin-sourced `user/message`. The client half registers a card into the `settings.plugin.item` slot.

## Key conventions

- **Bundle form**: `cordis.patch.yml` inserts one plugin row with `config` (composition base); `package.json` has `dsh.bundle.patch`. No source patches to DSH staging.
- **Dual-half**: host half (`src/index.ts`) has the session-start hook + settings namespace registration; client half (`src/client/`) has the settings card.
- **Pre-built `lib/` strategy**: `lib/` is committed (not in `.gitignore`); no `prepare` script; `github:` install works out of the box. Required because the client half depends on `@deepseek-ai/dsh-client-*` private peer deps.
- **Settings namespace**: `preface-context`. Registered via `ctx.inject(['settings'], ...)` conditional child (the plugin-row config is the composition `base`). The host `settings.mutate`/`settings.describe` RPCs (reached through the client Remote gateway since the apiproxy removal) accept any registered namespace (no allowlist on current upstream dsh), so the client card reads/writes through `ctx.settingsScope.bind()` directly — no `TypertRemoteService` gateway needed.
- **Client card is self-built**: the upstream `ui-settings-plugins` package's `PluginCard` / `CardForm` / `fields.tsx` are internal modules (not re-exported from the `/client` public face), so an external plugin cannot reuse them. The card chrome + form controller are reimplemented here (slim equivalents).
- **Card styles are injected, not served**: the client loader never serves `.css` artifacts; `src/client/preface-card.css.ts` holds a template-string stylesheet installed as one `<style data-plugin-css>` tag at activation (prefixed `dsh-pfc-*` class names replace the former CSS-modules map, whose empty export left the card unstyled).
- **`bindSnapshotSelector` inlined**: `@deepseek-ai/dsh-client-ui-renderer` does not re-export `bindSnapshotSelector` from its public `/client` face; business plugins must provide their own copy (`src/client/bind-snapshot-selector.ts`). (Not used in production code currently — the renderer auto-binds `usePrefaceCard` from the `hooks.prefaceCard` store — but kept for completeness.)
- **No `./invariant` (rc.1 rule)**: the plugin publishes no `./invariant` export — the session-start listener is a cordis effect auto-disposed with the plugin fiber and the settings registration rides its own conditional inject child, so there is no independent divergent observation; empty installers are invalid under the v0.1.2-rc.1 invariant rules. Reason recorded here and in README.
- **Alpha API (v0.1.2-alpha.1)**: `dsh-client-runtime` is gone — `ClientContext` became `@deepseek-ai/cordis` `Context`, the `ctx.slots` merge comes from `dsh-client-ui-renderer/client`, `SnapshotStore` from `dsh-client-store`, and `SettingsScope`/`SettingsScopeSnapshot` from `dsh-client-ui-settings/client`. Dev-time resolution: tsconfig paths + `node_modules/@deepseek-ai/*` junctions into the source checkout (created AFTER `pnpm install`; install with `--ignore-workspace --config.auto-install-peers=false`).

## File responsibilities

| File | Role |
|------|------|
| `src/index.ts` | Host entry: `name`/`inject`/`Config`/`apply` + `agent/session-start` listener + `buildPrefaceMessage` |
| `src/config.ts` | Schemastery `Config` schema + `resolvePrefaceConfig` (strict unknown-key rejection) |
| `src/settings.ts` | `installPrefaceSettings`: settings namespace registration + live source bridge |
| `src/client/index.ts` | Client entry: `inject = ['slots', 'locale', 'settingsScope']`, registers `settings.plugin.item` card |
| `src/client/preface-card.tsx` | The card component: collapsible chrome + enable toggle + textarea |
| `src/client/preface-card-controller.ts` | `PrefaceCardController`: staged edit / save / discard / reset over `SettingsScope` |
| `src/client/preface-card.css.ts` | Card stylesheet + `<style data-plugin-css>` install/dispose |
| `src/client/bind-snapshot-selector.ts` | Inlined uSES bridge (upstream shim) |
| `src/client/locales.ts` | English + Chinese dictionaries |

## Commands

```sh
pnpm run typecheck    # tsc --noEmit (host + client)
pnpm test             # vitest run (42 tests)
pnpm run build        # tsdown + tsc → lib/index.js, lib/client.js
pnpm run bundle:client # tsdown only (skip tsc; for fast client rebuilds)
```

## Data flow

### Session start injection

1. `agent/session-start` event fires (new session or resume).
2. `buildPrefaceMessage(bridge.source())` reads the live composed config.
3. If `enabled === false` or `contextText.trim() === ''`, returns `undefined` (no injection).
4. Otherwise, `createUserMessage({ content: [{type:'text', text}], source: {kind:'plugin', plugin, form:'instructions'} })`.
5. `agent.inject(message)` queues the message into the session inbox.
6. The first `agent/pre-step` claims it and includes it in the model request.

### Settings card read/write

1. `ctx.settingsScope.bind({ namespace: 'preface-context' })` returns a `SettingsScope<PrefaceConfig>`.
2. The scope reads via `settings.describe` (shared mirror) and writes via `settings.mutate` (serialized, revision-fenced).
3. `PrefaceCardController` stages edits locally and writes on save through `scope.set(field, value)` / `scope.unset(field)`.
