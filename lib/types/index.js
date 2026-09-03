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
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { installPrefaceSettings } from "./settings.js";
export const name = 'dsh-plugin-preface-context';
/** Services the plugin consumes; the row loads once all are available. */
export const inject = ['agents', 'llm'];
/** Loader schema (schemastery, strict) — validated by the cordis Loader. */
export { Config } from "./config.js";
/** Plugin source tag carried by every injected message. */
const PLUGIN_SOURCE = { kind: 'plugin', plugin: 'dsh-plugin-preface-context', form: 'instructions' };
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
export function buildPrefaceMessage(config) {
    if (!config.enabled)
        return undefined;
    const text = config.contextText.trim();
    if (text === '')
        return undefined;
    return createUserMessage({
        content: [{ type: 'text', text: config.contextText }],
        source: PLUGIN_SOURCE,
    });
}
/**
 * Plugin entry: install the settings bridge, then inject the preface text on
 * every session start.
 * @param ctx - the plugin's cordis context.
 * @param config - the composition entry config (base layer of the settings namespace).
 */
export function apply(ctx, config) {
    const bridge = installPrefaceSettings(ctx, config);
    ctx.on('agent/session-start', ({ agent }) => {
        const message = buildPrefaceMessage(bridge.source());
        if (message === undefined)
            return;
        agent.inject(message);
    });
}
