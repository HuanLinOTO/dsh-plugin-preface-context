import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from 'clsx';
import { css } from "./preface-card.css.js";
/**
 * Render the preface-context card.
 * @param props - the requested view, locale copy, the card snapshot, and its form actions.
 * @returns the one-liner for `summary`, or the form for `page`.
 */
export function PrefaceCard(props) {
    const { t } = props;
    // The row page draws the title and description itself; `summary` is the
    // fallback one-liner the page shows when the row carries none.
    if (props.view === 'summary')
        return t('description');
    const state = props.usePrefaceCard(snapshot => snapshot);
    if (!state.available)
        return null;
    const blocked = !state.dirty || state.saving;
    const enabledOn = state.enabled.text === 'true';
    // The card is the row detail page's sole content, so the edit body renders
    // flat and always expanded — no card-level disclosure header.
    return (_jsx("div", { className: css.card, children: _jsxs("div", { className: css.body, children: [!state.writable ? _jsx("p", { className: css.readOnly, role: "status", children: t('readOnly') }) : null, _jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, children: t('enabled') }), state.enabled.overridden
                                    ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: t('overridden') }), _jsx("button", { type: "button", className: css.reset, disabled: !state.writable, onClick: () => { props.resetField('enabled'); }, children: t('reset') })] }))
                                    : null] }), _jsx("div", { className: css.toggleRow, children: _jsx("button", { type: "button", role: "switch", "aria-checked": enabledOn, className: clsx(css.toggle, enabledOn && css.toggleOn), disabled: !state.writable, onClick: () => { props.edit('enabled', enabledOn ? 'false' : 'true'); }, children: _jsx("span", { className: clsx(css.knob, enabledOn && css.knobOn) }) }) }), _jsx("p", { className: css.hint, children: t('enabledHint') })] }), _jsxs("div", { className: css.field, children: [_jsxs("div", { className: css.head, children: [_jsx("label", { className: css.label, children: t('contextText') }), state.contextText.overridden
                                    ? (_jsxs("span", { className: css.badges, children: [_jsx("span", { className: css.badge, children: t('overridden') }), _jsx("button", { type: "button", className: css.reset, disabled: !state.writable, onClick: () => { props.resetField('contextText'); }, children: t('reset') })] }))
                                    : null] }), _jsx("textarea", { id: "plugin-config-preface-context-text", className: css.textarea, value: state.contextText.text, placeholder: t('contextTextPlaceholder'), disabled: !state.writable, onChange: (event) => { props.edit('contextText', event.target.value); } }), _jsx("p", { className: css.hint, children: t('contextTextHint') })] }), _jsxs("div", { className: css.footer, children: [state.dirty ? _jsx("span", { className: css.pending, children: t('unsaved') }) : null, state.failed ? _jsx("p", { className: css.failed, role: "status", children: t('saveFailed') }) : null, _jsx("button", { type: "button", className: css.discard, disabled: !state.dirty || state.saving, onClick: props.discard, children: t('discard') }), _jsx("button", { type: "button", className: css.save, disabled: blocked, onClick: props.save, children: t(state.saving ? 'saving' : 'save') })] })] }) }));
}
