import { createUserMessage } from "@deepseek-ai/dsh-llm";
import z from "@deepseek-ai/schemastery";

//#region src/settings.ts
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
function installPrefacePage(ctx) {
	ctx.inject(["settings"], (sctx) => {
		sctx.effect(() => sctx.settings.configure({ auto: false }, ctx.fiber));
	});
}

//#endregion
//#region src/config.ts
/**
* Schemastery schema for the plugin's profile-owned Config.
*
* Strict by construction: unknown keys fail validation in the Loader. The
* `.volatile()` fields are the ones the plugin-manager configuration form may
* edit.
*/
const Config = z.object({
	enabled: z.boolean().default(true).volatile(),
	contextText: z.string().default("").volatile()
});

//#endregion
//#region src/index.ts
const name = "dsh-plugin-preface-context";
/** Services the plugin consumes; the row loads once all are available. */
const inject = ["agents", "llm"];
/** Plugin source tag carried by every injected message. */
const PLUGIN_SOURCE = {
	kind: "preface-context",
	form: "instructions"
};
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
function buildPrefaceMessage(config) {
	if (!config.enabled) return void 0;
	if (config.contextText.trim() === "") return void 0;
	return createUserMessage({
		content: [{
			type: "text",
			text: config.contextText
		}],
		source: PLUGIN_SOURCE
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
function apply(ctx, config) {
	installPrefacePage(ctx);
	ctx.on("agent/created", ({ agent }) => {
		const message = buildPrefaceMessage({
			enabled: config.enabled.get(),
			contextText: config.contextText.get()
		});
		if (message === void 0) return;
		agent.inject(message);
	});
}

//#endregion
export { Config, apply, buildPrefaceMessage, inject, name };