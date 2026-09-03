window.__ModuleLoader__.load({ id: "@huanlin/dsh-plugin-preface-context", factory: (require) => {
var module = { exports: {} }; var exports = module.exports;
//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion
let react = require("react");
react = __toESM(react);
let __deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
__deepseek_ai_dsh_client_ui_primitives = __toESM(__deepseek_ai_dsh_client_ui_primitives);
let react_jsx_runtime = require("react/jsx-runtime");
react_jsx_runtime = __toESM(react_jsx_runtime);

//#region node_modules/.pnpm/clsx@2.1.1/node_modules/clsx/dist/clsx.mjs
function r(e) {
	var t, f, n = "";
	if ("string" == typeof e || "number" == typeof e) n += e;
	else if ("object" == typeof e) if (Array.isArray(e)) {
		var o = e.length;
		for (t = 0; t < o; t++) e[t] && (f = r(e[t])) && (n && (n += " "), n += f);
	} else for (f in e) e[f] && (n && (n += " "), n += f);
	return n;
}
function clsx() {
	for (var e, t, f = 0, n = "", o = arguments.length; f < o; f++) (e = arguments[f]) && (t = r(e)) && (n && (n += " "), n += t);
	return n;
}
var clsx_default = clsx;

//#endregion
//#region src/client/preface-card.css.ts
/**
* Card styles + runtime style injection for the preface-context settings
* card.
*
* The DSH client loader never serves `.css` artifacts — every style must be
* injected inside the bundle's factory closure (the same contract the
* upstream tsdown.client preset implements with lightningcss). A plain
* template-string stylesheet installed once at plugin activation is the slim
* equivalent for a hand-rolled bundle: static, prefixed class names
* (`dsh-pfc-*`, unique in the document) replace the hashed CSS-modules map,
* and the `<style data-plugin-css>` tag is removed when the plugin unloads.
*
* Colors resolve through `--dsw-alias-*` tokens so the card adapts to the
* light/dark theme.
*
* @module @huanlin/dsh-plugin-preface-context/client/preface-card.css
*/
/** Class-name map consumed by the card component (CSS-modules replacement). */
const css = {
	card: "dsh-pfc-card",
	cardOpen: "dsh-pfc-card--open",
	header: "dsh-pfc-header",
	headText: "dsh-pfc-head-text",
	name: "dsh-pfc-name",
	description: "dsh-pfc-description",
	pending: "dsh-pfc-pending",
	chevron: "dsh-pfc-chevron",
	chevronOpen: "dsh-pfc-chevron--open",
	body: "dsh-pfc-body",
	readOnly: "dsh-pfc-readonly",
	field: "dsh-pfc-field",
	head: "dsh-pfc-field-head",
	label: "dsh-pfc-label",
	badges: "dsh-pfc-badges",
	badge: "dsh-pfc-badge",
	reset: "dsh-pfc-reset",
	textarea: "dsh-pfc-textarea",
	toggleRow: "dsh-pfc-toggle-row",
	toggle: "dsh-pfc-toggle",
	toggleOn: "dsh-pfc-toggle--on",
	knob: "dsh-pfc-knob",
	knobOn: "dsh-pfc-knob--on",
	hint: "dsh-pfc-hint",
	footer: "dsh-pfc-footer",
	failed: "dsh-pfc-failed",
	discard: "dsh-pfc-discard",
	save: "dsh-pfc-save"
};
/** `data-plugin-css` tag id of the injected stylesheet. */
const STYLE_TAG_ID = "@huanlin/dsh-plugin-preface-context/preface-card.css";
/** The card stylesheet (injected as one tagged `<style>` at activation). */
const CSS = `
.dsh-pfc-card {
  list-style: none;
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22));
  background: var(--dsw-alias-bg-layer-3, transparent);
  border-radius: 12px;
  transition: border-color 0.16s, background 0.16s;
  overflow: hidden;
}

.dsh-pfc-card--open {
  border-color: var(--dsw-alias-border-l3, rgba(128, 128, 128, 0.35));
}

.dsh-pfc-header {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  font: inherit;
  color: inherit;
  text-align: left;
  background: transparent;
  border: 0;
  cursor: pointer;
}

.dsh-pfc-head-text {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.dsh-pfc-name {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--dsw-alias-label-primary, inherit);
}

.dsh-pfc-description {
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, rgba(128, 128, 128, 0.7));
}

.dsh-pfc-pending {
  flex: none;
  white-space: nowrap;
  font-size: 11px;
  font-weight: 500;
  line-height: 17px;
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary, inherit);
  background: var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.12));
}

.dsh-pfc-chevron {
  flex: none;
  display: inline-flex;
  align-items: center;
  color: var(--dsw-alias-label-tertiary, inherit);
  transition: transform 0.16s;
}

.dsh-pfc-chevron--open {
  transform: rotate(180deg);
}

.dsh-pfc-body {
  margin: 0 16px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22));
}

.dsh-pfc-readonly {
  margin: 0 0 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, rgba(128, 128, 128, 0.7));
}

.dsh-pfc-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 12px;
}

.dsh-pfc-field-head {
  display: flex;
  align-items: center;
  gap: 8px;
}

.dsh-pfc-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--dsw-alias-label-primary, inherit);
}

.dsh-pfc-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
}

.dsh-pfc-badge {
  font-size: 11px;
  font-weight: 500;
  line-height: 17px;
  padding: 1px 8px;
  border-radius: 999px;
  color: var(--dsw-alias-label-secondary, inherit);
  background: var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.12));
}

.dsh-pfc-reset {
  appearance: none;
  font: inherit;
  font-size: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  color: var(--dsw-alias-brand-primary, #0a84ff);
}

.dsh-pfc-reset:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dsh-pfc-textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 96px;
  resize: vertical;
  padding: 6px 10px;
  font-family: var(--dsw-font-mono, ui-monospace, monospace);
  font-size: 13px;
  line-height: 1.5;
  color: var(--dsw-alias-label-primary, inherit);
  background: var(--dsw-alias-bg-layer-3, transparent);
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  border-radius: 8px;
}

.dsh-pfc-textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary, #0a84ff);
}

.dsh-pfc-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dsh-pfc-toggle-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dsh-pfc-toggle {
  position: relative;
  width: 40px;
  height: 22px;
  flex: none;
  padding: 0;
  background: var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.12));
  border: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.3));
  border-radius: 999px;
  cursor: pointer;
  transition: background 0.16s, border-color 0.16s;
}

.dsh-pfc-toggle--on {
  background: var(--dsw-alias-brand-primary, #0a84ff);
  border-color: var(--dsw-alias-brand-primary, #0a84ff);
}

.dsh-pfc-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 16px;
  height: 16px;
  background: var(--dsw-alias-bg-layer-1, #fff);
  border-radius: 50%;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.16s;
}

.dsh-pfc-knob--on {
  transform: translateX(18px);
}

.dsh-pfc-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.dsh-pfc-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary, rgba(128, 128, 128, 0.6));
}

.dsh-pfc-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 0 4px;
  border-top: 1px solid var(--dsw-alias-border-l2, rgba(128, 128, 128, 0.22));
}

.dsh-pfc-failed {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: var(--dsw-alias-label-error, #ff453a);
}

.dsh-pfc-discard,
.dsh-pfc-save {
  appearance: none;
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  padding: 5px 14px;
  border: 1px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--dsw-alias-label-primary, inherit);
  background: var(--dsw-alias-bg-module-platform, rgba(128, 128, 128, 0.12));
  transition: background 0.16s, opacity 0.16s;
}

.dsh-pfc-save {
  background: var(--dsw-alias-brand-primary, #0a84ff);
  color: var(--dsw-alias-bg-layer-1, #fff);
}

.dsh-pfc-discard:disabled,
.dsh-pfc-save:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
`;
/**
* Install the card stylesheet as one tagged `<style>` element.
* @returns the disposer removing the tag (idempotent outside a document).
*/
function installPrefaceCardStyles() {
	if (typeof document === "undefined") return () => {};
	if (document.querySelector(`style[data-plugin-css='${STYLE_TAG_ID}']`) !== null) return () => {};
	const style = document.createElement("style");
	style.dataset.plugin = "@huanlin/dsh-plugin-preface-context";
	style.dataset.pluginCss = STYLE_TAG_ID;
	style.textContent = CSS;
	document.head.appendChild(style);
	return () => {
		style.remove();
	};
}

//#endregion
//#region src/client/preface-card.tsx
/**
* Render the preface-context card.
* @param props - locale copy, the card snapshot, and its form actions.
* @returns the card, or nothing when the namespace is unavailable.
*/
function PrefaceCard(props) {
	const [open, setOpen] = (0, react.useState)(false);
	const { t } = props;
	const state = props.usePrefaceCard((snapshot) => snapshot);
	if (!state.available) return null;
	const title = t("title");
	const blocked = !state.dirty || state.saving;
	const enabledOn = state.enabled.text === "true";
	return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("li", {
		className: clsx_default(css.card, open && css.cardOpen),
		children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
			type: "button",
			className: css.header,
			"aria-expanded": open,
			"aria-label": `${t(open ? "collapse" : "expand")}: ${title}`,
			onClick: () => {
				setOpen(!open);
			},
			children: [
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
					className: css.headText,
					children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: css.name,
						children: title
					}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: css.description,
						children: t("description")
					})]
				}),
				state.dirty ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
					className: css.pending,
					children: t("unsaved")
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsx)(__deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutline14, { className: clsx_default(css.chevron, open && css.chevronOpen) })
			]
		}), open ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
			className: css.body,
			children: [
				!state.writable ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
					className: css.readOnly,
					role: "status",
					children: t("readOnly")
				}) : null,
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.field,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: css.head,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: css.label,
								children: t("enabled")
							}), state.enabled.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.badges,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: css.badge,
									children: t("overridden")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: css.reset,
									disabled: !state.writable,
									onClick: () => {
										props.resetField("enabled");
									},
									children: t("reset")
								})]
							}) : null]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: css.toggleRow,
							children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								role: "switch",
								"aria-checked": enabledOn,
								className: clsx_default(css.toggle, enabledOn && css.toggleOn),
								disabled: !state.writable,
								onClick: () => {
									props.edit("enabled", enabledOn ? "false" : "true");
								},
								children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: clsx_default(css.knob, enabledOn && css.knobOn) })
							})
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: css.hint,
							children: t("enabledHint")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.field,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: css.head,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("label", {
								className: css.label,
								children: t("contextText")
							}), state.contextText.overridden ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
								className: css.badges,
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: css.badge,
									children: t("overridden")
								}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: css.reset,
									disabled: !state.writable,
									onClick: () => {
										props.resetField("contextText");
									},
									children: t("reset")
								})]
							}) : null]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("textarea", {
							id: "plugin-config-preface-context-text",
							className: css.textarea,
							value: state.contextText.text,
							placeholder: t("contextTextPlaceholder"),
							disabled: !state.writable,
							onChange: (event) => {
								props.edit("contextText", event.target.value);
							}
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: css.hint,
							children: t("contextTextHint")
						})
					]
				}),
				/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: css.footer,
					children: [
						state.failed ? /* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
							className: css.failed,
							role: "status",
							children: t("saveFailed")
						}) : null,
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.discard,
							disabled: !state.dirty || state.saving,
							onClick: props.discard,
							children: t("discard")
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: css.save,
							disabled: blocked,
							onClick: props.save,
							children: t(state.saving ? "saving" : "save")
						})
					]
				})
			]
		}) : null]
	});
}

//#endregion
//#region src/client/preface-card-controller.ts
/** A minimal snapshot store: a value + a listener set. Self-contained so the
* controller does not pull `createSnapshotStore` (a browser-bundle symbol)
* into its unit-test graph. */
var MiniSnapshotStore = class {
	snapshot;
	listeners = /* @__PURE__ */ new Set();
	constructor(initial) {
		this.snapshot = initial;
	}
	getSnapshot() {
		return this.snapshot;
	}
	set(value) {
		this.snapshot = value;
		for (const listener of [...this.listeners]) listener();
	}
	update(mutator) {
		const draft = Array.isArray(this.snapshot) ? [...this.snapshot] : { ...this.snapshot };
		mutator(draft);
		this.set(draft);
	}
	subscribe(listener) {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}
};
/** The default value for a field when the user-layer carries none. */
function baseValue(snapshot, field) {
	return snapshot.base?.[field];
}
/** The current resolved value of a field. */
function sectionValue(snapshot, field) {
	return snapshot.value?.[field];
}
/** Whether the user layer carries an entry for a field. */
function stored(snapshot, field) {
	const user = snapshot.user;
	return user !== void 0 && Object.hasOwn(user, field);
}
/** Format a stored value as draft text for a field. */
function format(field, value) {
	if (field === "enabled") return value === true ? "true" : "false";
	if (field === "contextText") return typeof value === "string" ? value : "";
	return "";
}
/** Parse draft text into a write value, or undefined when invalid. */
function parse(field, text) {
	if (field === "enabled") return { value: text === "true" };
	return text.trim() === "" ? { clear: true } : { value: text };
}
/**
* Bridges the `preface-context` scope onto the card's staged form.
*
* Publishes through a snapshot store because slot components read through a
* snapshot selector, while both the scope and the local drafts change
* underneath; every projection is rebuilt from the two together.
*/
var PrefaceCardController = class {
	scope;
	store;
	staged = /* @__PURE__ */ new Map();
	saving = false;
	failed = false;
	/** @param scope - the bound settings scope for the `preface-context` namespace. */
	constructor(scope) {
		this.scope = scope;
		this.store = new MiniSnapshotStore(this.project());
		scope.subscribe(() => {
			this.publish();
		});
	}
	/** @returns the store the card's component reads through its bound selector. */
	get snapshot() {
		return this.store;
	}
	project() {
		const snapshot = this.scope.getSnapshot();
		const dirty = this.staged.size > 0;
		return {
			available: snapshot.status === "ready",
			writable: snapshot.writable,
			dirty,
			saving: this.saving,
			failed: this.failed,
			enabled: this.fieldState(snapshot, "enabled"),
			contextText: this.fieldState(snapshot, "contextText")
		};
	}
	fieldState(snapshot, field) {
		const staged = this.staged.get(field);
		if (staged === void 0) return {
			text: format(field, sectionValue(snapshot, field)),
			overridden: stored(snapshot, field)
		};
		const write = staged.clear ? { clear: true } : parse(field, staged.text);
		return {
			text: staged.text,
			overridden: write !== void 0 && "value" in write
		};
	}
	/** Build the face the card's slot registration injects. */
	inject() {
		return {
			hooks: { prefaceCard: this.store },
			edit: (field, text) => {
				this.stage(field, {
					text,
					clear: false
				});
			},
			resetField: (field) => {
				this.stage(field, {
					text: format(field, baseValue(this.scope.getSnapshot(), field)),
					clear: true
				});
			},
			save: () => {
				this.save();
			},
			discard: () => {
				if (this.staged.size === 0 && !this.failed) return;
				this.staged.clear();
				this.failed = false;
				this.publish();
			}
		};
	}
	stage(field, edit) {
		this.staged.set(field, edit);
		this.failed = false;
		this.publish();
	}
	publish() {
		this.store.set(this.project());
	}
	/** Write every staged edit, then re-seed from what the Host accepted. */
	async save() {
		if (this.staged.size === 0 || this.saving) return;
		this.saving = true;
		this.failed = false;
		this.publish();
		let landed = true;
		for (const [field, staged] of this.staged) {
			const write = staged.clear ? { clear: true } : parse(field, staged.text);
			if (write === void 0) continue;
			try {
				if ("clear" in write) await this.scope.unset(field);
				else await this.scope.set(field, write.value);
			} catch {
				landed = false;
			}
		}
		if (landed) this.staged.clear();
		this.saving = false;
		this.failed = !landed;
		this.publish();
	}
};

//#endregion
//#region src/client/locales.ts
/** English copy. */
const en = {
	title: "Preface context",
	description: "Inject a text block as model-visible instructions at the start of every session.",
	enabled: "Enabled",
	enabledHint: "When off, no context is injected at session start.",
	contextText: "Context text",
	contextTextHint: "Injected once per session as instructions context, closest to the model’s first answer. Empty text injects nothing.",
	contextTextPlaceholder: "Enter the text to inject at the start of every session…",
	overridden: "Overridden",
	reset: "Reset to default",
	save: "Save",
	saving: "Saving…",
	discard: "Discard",
	unsaved: "Unsaved",
	saveFailed: "The deployment did not accept these values; they were left for you to correct.",
	readOnly: "This deployment stores settings read-only.",
	expand: "Show settings",
	collapse: "Hide settings"
};
/** Simplified Chinese copy. */
const zh = {
	title: "前言上下文",
	description: "在每次会话开头注入一段文本作为模型可见的指令上下文。",
	enabled: "启用",
	enabledHint: "关闭后，会话开始时不注入任何上下文。",
	contextText: "上下文文本",
	contextTextHint: "每次会话注入一次，作为指令上下文最贴近模型的首个回答。文本为空则不注入。",
	contextTextPlaceholder: "输入要在每次会话开头注入的文本…",
	overridden: "已覆盖",
	reset: "恢复默认",
	save: "保存",
	saving: "保存中…",
	discard: "放弃修改",
	unsaved: "未保存",
	saveFailed: "本部署没有接受这些值，已保留供你修改。",
	readOnly: "本部署的设置为只读。",
	expand: "展开设置",
	collapse: "收起设置"
};

//#endregion
//#region src/client/index.ts
/** Dictionary namespace owned by this plugin. */
const NS = "settings.preface-context";
/** Settings namespace the host half registers (must match the host constant). */
const SETTINGS_NAMESPACE = "preface-context";
/**
* Required services (cordis fiber inject). `settingsScope` is provided by the
* ui-settings base plugin; `locale` by the locale plugin; `slots` is the
* composition root. The target slot is declared by ui-settings-plugins'
* `configurable` tab, whose activation order relative to this one is
* unconstrained; registration depends on the slot through `slots.inject()`.
*/
const inject = [
	"slots",
	"locale",
	"settingsScope"
];
/**
* Register the preface-context card once the `settings.plugin.item`
* declaration is on the ledger, wire its controller to the settings scope,
* and keep it fresh on every pushed invalidation.
* @param ctx - client root context.
*/
function apply(ctx) {
	ctx.effect(installPrefaceCardStyles, "preface-context: card styles");
	ctx.effect(() => ctx.locale.register(NS, {
		zh,
		en
	}), "preface-context: copy dictionaries");
	const settingsScope = ctx.settingsScope;
	const controller = new PrefaceCardController(settingsScope.bind({ namespace: SETTINGS_NAMESPACE }));
	ctx.slots.inject("settings.plugin.item", function* () {
		yield ctx.slots.register({
			name: "settings.plugin.item",
			key: SETTINGS_NAMESPACE,
			locale: NS,
			inject: () => controller.inject()
		}, PrefaceCard);
	});
}

//#endregion
exports.apply = apply;
exports.inject = inject;
return module.exports; } });
//# sourceMappingURL=client.js.map