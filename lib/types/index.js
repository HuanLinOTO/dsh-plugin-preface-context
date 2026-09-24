/**
 * dsh-plugin-preface-context — injects a user-configured text block as
 * model-visible instructions context at the start of every session.
 *
 * The plugin listens to `agent/created` and, when enabled and the context text
 * is non-empty, calls `agent.inject()` with a plugin-sourced `user/message`
 * carrying the text as a single text block. The message enters the session
 * inbox and is claimed by the first `agent/pre-step`, reaching the model as
 * instructions context closest to its first answer.
 *
 * Since dsh 0.1.7-rc.1 the text and the enable switch are the plugin's own
 * volatile Config fields (see `src/config.ts`): `apply` reads the live
 * references through `.get()` on every session creation, so a profile edit
 * takes effect on the next session start without a restart. The host half also
 * marks the entry as shipping its own page; the client half registers the card
 * into the Plugins page's `plugins.row.config` slot.
 *
 * @module @huanlin/dsh-plugin-preface-context
 */
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import { installPrefacePage } from "./settings.js";
export const name = 'dsh-plugin-preface-context';
/** Services the plugin consumes; the row loads once all are available. */
export const inject = ['agents', 'llm'];
/** Loader schema (schemastery, strict) — validated by the cordis Loader. */
export { Config } from "./config.js";
/** Plugin source tag carried by every injected message. */
const PLUGIN_SOURCE = { kind: 'preface-context', form: 'instructions' };
/**
 * Build the user-message to inject for one session creation.
 *
 * The message carries the context text as a single text block and is tagged
 * `source.kind: 'preface-context'` with `form: 'instructions'` so the model
 * and UI can present it as workspace instructions rather than a user prompt.
 * @param config - the live config values.
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
 * Plugin entry: declare that the plugin ships its own page, then inject the
 * preface text on every agent creation.
 *
 * `agent/created` fires for create (`'startup'`), resume, clear, and compact.
 * The listener reads the volatile Config references at each event, so a live
 * profile edit is picked up by the next session without a remount.
 * @param ctx - the plugin's cordis context.
 * @param config - the resolved volatile Config references.
 */
export function apply(ctx, config) {
    installPrefacePage(ctx);
    ctx.on('agent/created', ({ agent }) => {
        const message = buildPrefaceMessage({
            enabled: config.enabled.get(),
            contextText: config.contextText.get(),
        });
        if (message === undefined)
            return;
        agent.inject(message);
    });
}
