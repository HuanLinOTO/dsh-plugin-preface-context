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
/** A minimal snapshot store: a value + a listener set. Self-contained so the
 * controller does not pull `createSnapshotStore` (a browser-bundle symbol)
 * into its unit-test graph. */
class MiniSnapshotStore {
    snapshot;
    listeners = new Set();
    constructor(initial) {
        this.snapshot = initial;
    }
    getSnapshot() {
        return this.snapshot;
    }
    set(value) {
        this.snapshot = value;
        for (const listener of [...this.listeners])
            listener();
    }
    update(mutator) {
        // Shallow-clone then mutate (the projections here are plain objects with
        // no nested mutation, so a deep immer draft is unnecessary).
        const draft = Array.isArray(this.snapshot) ? [...this.snapshot] : { ...this.snapshot };
        mutator(draft);
        this.set(draft);
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    }
}
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
    return user !== undefined && Object.hasOwn(user, field);
}
/** Format a stored value as draft text for a field. */
function format(field, value) {
    if (field === 'enabled')
        return value === true ? 'true' : 'false';
    if (field === 'contextText')
        return typeof value === 'string' ? value : '';
    return '';
}
/** Parse draft text into a write value, or undefined when invalid. */
function parse(field, text) {
    if (field === 'enabled') {
        // The toggle is a boolean; the textarea is not used for this field.
        return { value: text === 'true' };
    }
    // contextText: empty draft clears the field; otherwise the raw text is the
    // value. Internal whitespace and newlines are preserved.
    const trimmed = text.trim();
    return trimmed === '' ? { clear: true } : { value: text };
}
/**
 * Bridges the entry's `ConfigForm` onto the card's staged form.
 *
 * Publishes through a snapshot store because slot components read through a
 * snapshot selector, while both the form and the local drafts change
 * underneath; every projection is rebuilt from the two together.
 */
export class PrefaceCardController {
    scope;
    store;
    staged = new Map();
    saving = false;
    failed = false;
    /** @param scope - the bound `ConfigForm` for the `dsh-plugin-preface-context` entry. */
    constructor(scope) {
        this.scope = scope;
        this.store = new MiniSnapshotStore(this.project());
        scope.subscribe(() => { this.publish(); });
    }
    /** @returns the store the card's component reads through its bound selector. */
    get snapshot() {
        return this.store;
    }
    project() {
        const snapshot = this.scope.getSnapshot();
        const dirty = this.staged.size > 0;
        return {
            available: snapshot.status === 'ready',
            writable: snapshot.writable,
            dirty,
            saving: this.saving,
            failed: this.failed,
            enabled: this.fieldState(snapshot, 'enabled'),
            contextText: this.fieldState(snapshot, 'contextText'),
        };
    }
    fieldState(snapshot, field) {
        const staged = this.staged.get(field);
        if (staged === undefined) {
            return { text: format(field, sectionValue(snapshot, field)), overridden: stored(snapshot, field) };
        }
        const write = staged.clear ? { clear: true } : parse(field, staged.text);
        return {
            text: staged.text,
            overridden: write !== undefined && 'value' in write,
        };
    }
    /** Build the face the card's slot registration injects. */
    inject() {
        return {
            hooks: { prefaceCard: this.store },
            edit: (field, text) => { this.stage(field, { text, clear: false }); },
            resetField: (field) => {
                this.stage(field, { text: format(field, baseValue(this.scope.getSnapshot(), field)), clear: true });
            },
            save: () => { void this.save(); },
            discard: () => {
                if (this.staged.size === 0 && !this.failed)
                    return;
                this.staged.clear();
                this.failed = false;
                this.publish();
            },
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
        if (this.staged.size === 0 || this.saving)
            return;
        this.saving = true;
        this.failed = false;
        this.publish();
        let landed = true;
        for (const [field, staged] of this.staged) {
            const write = staged.clear ? { clear: true } : parse(field, staged.text);
            if (write === undefined)
                continue;
            try {
                // `set`/`unset` resolve to whether the Host accepted the write; a
                // refusal (false) keeps the drafts for correction.
                const accepted = 'clear' in write
                    ? await this.scope.unset(field)
                    : await this.scope.set(field, write.value);
                if (!accepted)
                    landed = false;
            }
            catch {
                landed = false;
            }
        }
        if (landed)
            this.staged.clear();
        this.saving = false;
        this.failed = !landed;
        this.publish();
    }
}
