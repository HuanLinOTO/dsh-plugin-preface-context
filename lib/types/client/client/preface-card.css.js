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
export const css = {
    card: 'dsh-pfc-card',
    cardOpen: 'dsh-pfc-card--open',
    header: 'dsh-pfc-header',
    headText: 'dsh-pfc-head-text',
    name: 'dsh-pfc-name',
    description: 'dsh-pfc-description',
    pending: 'dsh-pfc-pending',
    chevron: 'dsh-pfc-chevron',
    chevronOpen: 'dsh-pfc-chevron--open',
    body: 'dsh-pfc-body',
    readOnly: 'dsh-pfc-readonly',
    field: 'dsh-pfc-field',
    head: 'dsh-pfc-field-head',
    label: 'dsh-pfc-label',
    badges: 'dsh-pfc-badges',
    badge: 'dsh-pfc-badge',
    reset: 'dsh-pfc-reset',
    textarea: 'dsh-pfc-textarea',
    toggleRow: 'dsh-pfc-toggle-row',
    toggle: 'dsh-pfc-toggle',
    toggleOn: 'dsh-pfc-toggle--on',
    knob: 'dsh-pfc-knob',
    knobOn: 'dsh-pfc-knob--on',
    hint: 'dsh-pfc-hint',
    footer: 'dsh-pfc-footer',
    failed: 'dsh-pfc-failed',
    discard: 'dsh-pfc-discard',
    save: 'dsh-pfc-save',
};
/** `data-plugin-css` tag id of the injected stylesheet. */
const STYLE_TAG_ID = '@huanlin/dsh-plugin-preface-context/preface-card.css';
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
export function installPrefaceCardStyles() {
    if (typeof document === 'undefined')
        return () => { };
    if (document.querySelector(`style[data-plugin-css='${STYLE_TAG_ID}']`) !== null)
        return () => { };
    const style = document.createElement('style');
    style.dataset.plugin = '@huanlin/dsh-plugin-preface-context';
    style.dataset.pluginCss = STYLE_TAG_ID;
    style.textContent = CSS;
    document.head.appendChild(style);
    return () => { style.remove(); };
}
