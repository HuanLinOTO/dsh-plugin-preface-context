/**
 * The preface-context card's staged form over the plugin's profile entry
 * Config.
 *
 * The upstream `ui-settings-plugins` package owns a `CardForm` helper, but it
 * is an internal module (not re-exported from the package's `/client` public
 * face), so an external plugin cannot reuse it. This controller is a slim
 * equivalent: it stages the two fields (`enabled` boolean, `contextText`
 * multiline string) and writes them through the bound {@link ConfigForm}
 * on save, re-deriving its projection whenever the form or a draft changes.
 *
 * Unlike the upstream `CardForm`, the `contextText` field is a multiline
 * textarea: its draft preserves internal whitespace and newlines (the
 * upstream `textField` helper trims, which would collapse a multi-paragraph
 * preface into one line).
 */
import type { SnapshotStore } from '@deepseek-ai/dsh-client-store';
import type { ConfigForm } from '@deepseek-ai/dsh-client-ui-settings/client';
/** The two fields this card edits, as draft text. */
export interface PrefaceDraft {
    /** `enabled` draft �?'true' or 'false'. */
    enabled: string;
    /** `contextText` draft �?the raw textarea value, whitespace preserved. */
    contextText: string;
}
/** One field's render state. */
export interface PrefaceFieldState {
    /** Draft text the control renders. */
    text: string;
    /** Whether saving would leave a user-layer entry for this field. */
    overridden: boolean;
}
/** Card-level state shared with the component. */
export interface PrefaceCardState {
    /** False while the namespace is not served to this client. */
    available: boolean;
    /** Whether the Host document accepts writes. */
    writable: boolean;
    /** Whether the form holds edits that a save would write. */
    dirty: boolean;
    /** Whether a save is crossing the wire. */
    saving: boolean;
    /** Whether the last save did not land as staged. */
    failed: boolean;
    /** The `enabled` field state. */
    enabled: PrefaceFieldState;
    /** The `contextText` field state. */
    contextText: PrefaceFieldState;
}
/** The write actions the card's slot entry injects. */
export interface PrefaceCardActions {
    /** Stage draft text for one field. */
    edit: (field: keyof PrefaceDraft, text: string) => void;
    /** Stage a clear, so saving lets the field re-inherit the composition layer. */
    resetField: (field: keyof PrefaceDraft) => void;
    /** Write every staged edit, then re-seed from what the Host accepted. */
    save: () => void;
    /** Drop every staged edit. */
    discard: () => void;
}
/** The registration-side face the card's slot entry injects. */
export interface PrefaceCardFace {
    hooks: {
        /** Card snapshot bound by the renderer as usePrefaceCard. */
        prefaceCard: SnapshotStore<PrefaceCardState>;
    };
}
/**
 * Bridges the `preface-context` scope onto the card's staged form.
 *
 * Publishes through a snapshot store because slot components read through a
 * snapshot selector, while both the scope and the local drafts change
 * underneath; every projection is rebuilt from the two together.
 */
export declare class PrefaceCardController {
    private readonly scope;
    private readonly store;
    private readonly staged;
    private saving;
    private failed;
    /** @param scope - the bound settings scope for the `preface-context` namespace. */
    constructor(scope: ConfigForm<Record<string, unknown>>);
    /** @returns the store the card's component reads through its bound selector. */
    get snapshot(): SnapshotStore<PrefaceCardState>;
    private project;
    private fieldState;
    /** Build the face the card's slot registration injects. */
    inject(): PrefaceCardFace & PrefaceCardActions;
    private stage;
    private publish;
    /** Write every staged edit, then re-seed from what the Host accepted. */
    private save;
}
