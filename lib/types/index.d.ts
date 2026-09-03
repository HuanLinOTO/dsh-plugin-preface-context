/**
 * dsh-plugin-preface-context — injects a user-configured text block as
 * model-visible instructions context at the start of every session.
 *
 * The plugin listens to `agent/session-start` and, when enabled and the
 * context text is non-empty, calls `agent.inject()` with a plugin-sourced
 * `user/message` carrying the text as a single text block. The message
 * enters the session inbox and is claimed by the first `agent/pre-step`,
 * reaching the model as instructions context closest to its first answer.
 *
 * The text and the enable switch are editable on the "插件配置" settings
 * page: the host registers the `preface-context` settings namespace (the
 * plugin-row config is the composition base), and the client half binds a
 * card to that namespace through `ctx.settingsScope.bind()`. The runtime
 * reads the LIVE composed value through the bridge source, so a settings
 * edit takes effect on the next session start without a restart.
 *
 * @module @huanlin/dsh-plugin-preface-context
 */
import type { Context } from '@deepseek-ai/cordis';
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import type { PrefaceConfig } from './config.ts';
export declare const name = "dsh-plugin-preface-context";
/** Services the plugin consumes; the row loads once all are available. */
export declare const inject: string[];
/** Loader schema (schemastery, strict) — validated by the cordis Loader. */
export { Config } from './config.ts';
export type { PrefaceConfig } from './config.ts';
/**
 * Build the user-message to inject for one session start.
 *
 * The message carries the context text as a single text block and is tagged
 * `source.kind: 'plugin'` with `form: 'instructions'` so the model and UI
 * can present it as workspace instructions rather than a user prompt.
 * @param config - the live composed config.
 * @returns the message to inject, or `undefined` when injection is disabled
 *   or the text is empty/whitespace.
 */
export declare function buildPrefaceMessage(config: PrefaceConfig): ReturnType<typeof createUserMessage> | undefined;
/**
 * Plugin entry: install the settings bridge, then inject the preface text on
 * every session start.
 * @param ctx - the plugin's cordis context.
 * @param config - the composition entry config (base layer of the settings namespace).
 */
export declare function apply(ctx: Context, config: PrefaceConfig): void;
