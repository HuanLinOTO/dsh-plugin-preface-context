import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * The preface-context configuration card: a collapsible card on the plugin's
 * row page in the Plugins manager (`plugins.row.config`). Renders an enable
 * toggle and a multiline textarea for the context text. Stages edits locally
 * and writes them on save through the bound {@link PrefaceCardController}.
 *
 * The chrome mirrors the upstream `PluginCard` shape (a header button
 * stacking name over description, a dirty pill, a rotating chevron; a body
 * with the form controls and a footer with Discard/Save) because the
 * upstream client value face exports no reusable card. Styles come from the
 * statically injected `preface-card.css` stylesheet (the loader never serves
 * `.css` artifacts); every color resolves through a `--dsw-alias-*` token so
 * the card adapts to the light/dark theme.
 */
import { useState } from 'react';
import clsx from 'clsx';
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives';
import { css } from "./preface-card.css.js";
/**
 * Render the preface-context card.
 * @param props - the requested view, locale copy, the card snapshot, and its form actions.
 * @returns the one-liner for `summary`, or the form for `page`.
 */
export function PrefaceCard(props) {
    const [open, setOpen] = useState(false);
    const { t } = props;
    // The row page draws the title and description itself; `summary` is the
    // fallback one-liner the page shows when the row carries none.
    if (props.view === 'summary')
        return t('description');
    const state = props.usePrefaceCard(snapshot => snapshot);
    if (!state.available)
        return null;
    const title = t('title');
    const blocked = !state.dirty || state.saving;
    const enabledOn = state.enabled.text === 'true';
    return (_jsxs("div", { className: clsx(css.card, open && css.cardOpen), children: [_jsxs("button", { type: "button", className: css.header, "aria-expanded": open, "aria-label": `${t(open ? 'collapse' : 'expand')}: ${title}`, onClick: () => { setOpen(!open); }, children: [_jsxs("span", { className: css.headText, children: [_jsx("span", { className: css.name, children: title }), _jsx("span", { className: css.description, children: t('description') })] }), state.dirty ? _jsx("span", { className: css.pending, children: t('unsaved') }) : null, _jsx(IconChevronDownOutlineRegular, { className: clsx(css.chevron, open && css.chevronOpen) })] }), open
                ? (_jsxs("div", { className: css.body, children: [!state.writable ? _jsx("p", { className: css.readOnly, role: "status", children: t('readOnly') }) : null, _jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, children: t('enabled') }), state.enabled.overridden
                                            ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: t('overridden') }), _jsx("button", { type: "button", className: css.reset, disabled: !state.writable, onClick: () => { props.resetField('enabled'); }, children: t('reset') })] }))
                                            : null] }), _jsx("div", { className: css.toggleRow, children: _jsx("button", { type: "button", role: "switch", "aria-checked": enabledOn, className: clsx(css.toggle, enabledOn && css.toggleOn), disabled: !state.writable, onClick: () => { props.edit('enabled', enabledOn ? 'false' : 'true'); }, children: _jsx("span", { className: clsx(css.knob, enabledOn && css.knobOn) }) }) }), _jsx("p", { className: css.hint, children: t('enabledHint') })] }), _jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, children: t('contextText') }), state.contextText.overridden
                                            ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: t('overridden') }), _jsx("button", { type: "button", className: css.reset, disabled: !state.writable, onClick: () => { props.resetField('contextText'); }, children: t('reset') })] }))
                                            : null] }), _jsx("textarea", { id: "plugin-config-preface-context-text", className: css.textarea, value: state.contextText.text, placeholder: t('contextTextPlaceholder'), disabled: !state.writable, onChange: (event) => { props.edit('contextText', event.target.value); } }), _jsx("p", { className: css.hint, children: t('contextTextHint') })] }), _jsxs("div", { className: css.footer, children: [state.failed ? _jsx("p", { className: css.failed, role: "status", children: t('saveFailed') }) : null, _jsx("button", { type: "button", className: css.discard, disabled: !state.dirty || state.saving, onClick: props.discard, children: t('discard') }), _jsx("button", { type: "button", className: css.save, disabled: blocked, onClick: props.save, children: t(state.saving ? 'saving' : 'save') })] })] }))
                : null] }));
}
