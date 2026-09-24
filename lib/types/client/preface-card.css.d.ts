/**
 * Card styles + runtime style injection for the preface-context settings
 * card. The card is the sole content of the plugin's dedicated row detail
 * page (`plugins.row.config`), rendered flat with no disclosure header.
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
export declare const css: {
    readonly card: "dsh-pfc-card";
    readonly pending: "dsh-pfc-pending";
    readonly body: "dsh-pfc-body";
    readonly readOnly: "dsh-pfc-readonly";
    readonly field: "dsh-pfc-field";
    readonly head: "dsh-pfc-field-head";
    readonly label: "dsh-pfc-label";
    readonly badges: "dsh-pfc-badges";
    readonly badge: "dsh-pfc-badge";
    readonly reset: "dsh-pfc-reset";
    readonly textarea: "dsh-pfc-textarea";
    readonly toggleRow: "dsh-pfc-toggle-row";
    readonly toggle: "dsh-pfc-toggle";
    readonly toggleOn: "dsh-pfc-toggle--on";
    readonly knob: "dsh-pfc-knob";
    readonly knobOn: "dsh-pfc-knob--on";
    readonly hint: "dsh-pfc-hint";
    readonly footer: "dsh-pfc-footer";
    readonly failed: "dsh-pfc-failed";
    readonly discard: "dsh-pfc-discard";
    readonly save: "dsh-pfc-save";
};
/**
 * Install the card stylesheet as one tagged `<style>` element.
 * @returns the disposer removing the tag (idempotent outside a document).
 */
export declare function installPrefaceCardStyles(): () => void;
