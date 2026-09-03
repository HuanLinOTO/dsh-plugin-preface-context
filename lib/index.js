import { createUserMessage } from "@deepseek-ai/dsh-llm";
import z from "schemastery";

//#region src/config.ts
/**
* Schemastery schema for the `preface-context` settings namespace.
*
* Strict by construction: unknown keys fail validation here, even though the
* settings service itself is non-strict and would otherwise accept them.
*/
const Config = z.object({
	enabled: z.boolean().default(true),
	contextText: z.string().default("")
});

//#endregion
//#region src/settings.ts
/** The `preface-context` settings namespace (registered when a settings service exists). */
const PREFACE_SETTINGS_NAMESPACE = "preface-context";
/**
* Mirror of @deepseek-ai/dsh-settings' `isUnloading` guard (its
* `installSettingsSection` skips source/listener work while the plugin fiber
* is unloading or disposed). The library compares `ctx.fiber.state` against
* `FiberState.DISPOSED` / `FiberState.UNLOADING`; the const enum is erased at
* runtime, so the vendored numeric values (4 / 5) are mirrored here.
*/
function isUnloading(ctx) {
	const state = ctx.fiber?.state;
	return state === 4 || state === 5;
}
/**
* Install the `preface-context` settings namespace and wire the live source.
*
* Mirrors the dsh `installSettingsSection` pattern. The registration rides a
* conditional `ctx.inject(['settings'], ...)` child, so with no settings
* service the source stays the entry config. Multi-fiber dedupe: the host
* may compose several preface-context fibers, and `settings.register` fails
* loud on a duplicate namespace — the catch lets the first registration own
* the live namespace while later instances fall back to the entry source.
* @param ctx - consumer plugin context owning the wiring.
* @param entry - the composition entry config, used as `base`.
* @returns the bridge the runtime and gateway read through.
*/
function installPrefaceSettings(ctx, entry) {
	const listeners = /* @__PURE__ */ new Set();
	let source = () => entry;
	const notify = () => {
		for (const listener of [...listeners]) listener();
	};
	ctx.inject(["settings"], (sctx) => {
		let scope;
		try {
			scope = sctx.settings.register(PREFACE_SETTINGS_NAMESPACE, Config, { base: entry });
		} catch (error) {
			if (!(error instanceof Error) || !error.message.includes("already registered")) throw error;
			ctx.logger("preface-context").debug("settings namespace already registered — entry-source fallback (multi-fiber dedupe)");
			return;
		}
		source = () => scope.get();
		sctx.effect(() => () => {
			if (isUnloading(ctx)) return;
			source = () => entry;
			notify();
		});
		notify();
		scope.watch(() => {
			if (isUnloading(ctx)) return;
			notify();
		});
	});
	return {
		source: () => source(),
		onChange: (callback) => {
			listeners.add(callback);
		}
	};
}

//#endregion
//#region src/index.ts
const name = "dsh-plugin-preface-context";
/** Services the plugin consumes; the row loads once all are available. */
const inject = ["agents", "llm"];
/** Plugin source tag carried by every injected message. */
const PLUGIN_SOURCE = {
	kind: "plugin",
	plugin: "dsh-plugin-preface-context",
	form: "instructions"
};
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
* Plugin entry: install the settings bridge, then inject the preface text on
* every session start.
* @param ctx - the plugin's cordis context.
* @param config - the composition entry config (base layer of the settings namespace).
*/
function apply(ctx, config) {
	const bridge = installPrefaceSettings(ctx, config);
	ctx.on("agent/session-start", ({ agent }) => {
		const message = buildPrefaceMessage(bridge.source());
		if (message === void 0) return;
		agent.inject(message);
	});
}

//#endregion
export { Config, apply, buildPrefaceMessage, inject, name };