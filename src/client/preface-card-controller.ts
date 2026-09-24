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

import type { SnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { ConfigForm, ConfigFormSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'

/** A minimal snapshot store: a value + a listener set. Self-contained so the
 * controller does not pull `createSnapshotStore` (a browser-bundle symbol)
 * into its unit-test graph. */
class MiniSnapshotStore<T> implements SnapshotStore<T> {
  private snapshot: T
  private readonly listeners = new Set<() => void>()

  constructor(initial: T) {
    this.snapshot = initial
  }

  getSnapshot(): T {
    return this.snapshot
  }

  set(value: T): void {
    this.snapshot = value
    for (const listener of [...this.listeners]) listener()
  }

  update(mutator: (draft: T) => void): void {
    // Shallow-clone then mutate (the projections here are plain objects with
    // no nested mutation, so a deep immer draft is unnecessary).
    const draft = Array.isArray(this.snapshot) ? [...this.snapshot] as unknown as T : { ...this.snapshot as object } as T
    mutator(draft)
    this.set(draft)
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }
}

/** The two fields this card edits, as draft text. */
export interface PrefaceDraft {
  /** `enabled` draft �?'true' or 'false'. */
  enabled: string
  /** `contextText` draft �?the raw textarea value, whitespace preserved. */
  contextText: string
}

/** One field's render state. */
export interface PrefaceFieldState {
  /** Draft text the control renders. */
  text: string
  /** Whether saving would leave a user-layer entry for this field. */
  overridden: boolean
}

/** Card-level state shared with the component. */
export interface PrefaceCardState {
  /** False while the namespace is not served to this client. */
  available: boolean
  /** Whether the Host document accepts writes. */
  writable: boolean
  /** Whether the form holds edits that a save would write. */
  dirty: boolean
  /** Whether a save is crossing the wire. */
  saving: boolean
  /** Whether the last save did not land as staged. */
  failed: boolean
  /** The `enabled` field state. */
  enabled: PrefaceFieldState
  /** The `contextText` field state. */
  contextText: PrefaceFieldState
}

/** The write actions the card's slot entry injects. */
export interface PrefaceCardActions {
  /** Stage draft text for one field. */
  edit: (field: keyof PrefaceDraft, text: string) => void
  /** Stage a clear, so saving lets the field re-inherit the composition layer. */
  resetField: (field: keyof PrefaceDraft) => void
  /** Write every staged edit, then re-seed from what the Host accepted. */
  save: () => void
  /** Drop every staged edit. */
  discard: () => void
}

/** The registration-side face the card's slot entry injects. */
export interface PrefaceCardFace {
  hooks: {
    /** Card snapshot bound by the renderer as usePrefaceCard. */
    prefaceCard: SnapshotStore<PrefaceCardState>
  }
}

/** Field names this card edits, keyed for the staged-edit map. */
type FieldName = keyof PrefaceDraft

/** One staged edit. */
interface StagedEdit {
  /** Draft text the control renders. */
  text: string
  /** True when this edit clears the field. */
  clear: boolean
}

/** The default value for a field when the user-layer carries none. */
function baseValue(snapshot: ConfigFormSnapshot<Record<string, unknown>>, field: FieldName): unknown {
  return (snapshot.base as Record<string, unknown> | undefined)?.[field]
}

/** The current resolved value of a field. */
function sectionValue(snapshot: ConfigFormSnapshot<Record<string, unknown>>, field: FieldName): unknown {
  return (snapshot.value as Record<string, unknown> | undefined)?.[field]
}

/** Whether the user layer carries an entry for a field. */
function stored(snapshot: ConfigFormSnapshot<Record<string, unknown>>, field: FieldName): boolean {
  const user = snapshot.user as Record<string, unknown> | undefined
  return user !== undefined && Object.hasOwn(user, field)
}

/** Format a stored value as draft text for a field. */
function format(field: FieldName, value: unknown): string {
  if (field === 'enabled') return value === true ? 'true' : 'false'
  if (field === 'contextText') return typeof value === 'string' ? value : ''
  return ''
}

/** Parse draft text into a write value, or undefined when invalid. */
function parse(field: FieldName, text: string): { value: unknown } | { clear: true } | undefined {
  if (field === 'enabled') {
    // The toggle is a boolean; the textarea is not used for this field.
    return { value: text === 'true' }
  }
  // contextText: empty draft clears the field; otherwise the raw text is the
  // value. Internal whitespace and newlines are preserved.
  const trimmed = text.trim()
  return trimmed === '' ? { clear: true } : { value: text }
}

/**
 * Bridges the `preface-context` scope onto the card's staged form.
 *
 * Publishes through a snapshot store because slot components read through a
 * snapshot selector, while both the scope and the local drafts change
 * underneath; every projection is rebuilt from the two together.
 */
export class PrefaceCardController {
  private readonly scope: ConfigForm<Record<string, unknown>>
  private readonly store: SnapshotStore<PrefaceCardState>
  private readonly staged = new Map<FieldName, StagedEdit>()
  private saving = false
  private failed = false

  /** @param scope - the bound settings scope for the `preface-context` namespace. */
  constructor(scope: ConfigForm<Record<string, unknown>>) {
    this.scope = scope
    this.store = new MiniSnapshotStore<PrefaceCardState>(this.project())
    scope.subscribe(() => { this.publish() })
  }

  /** @returns the store the card's component reads through its bound selector. */
  get snapshot(): SnapshotStore<PrefaceCardState> {
    return this.store
  }

  private project(): PrefaceCardState {
    const snapshot = this.scope.getSnapshot()
    const dirty = this.staged.size > 0
    return {
      available: snapshot.status === 'ready',
      writable: snapshot.writable,
      dirty,
      saving: this.saving,
      failed: this.failed,
      enabled: this.fieldState(snapshot, 'enabled'),
      contextText: this.fieldState(snapshot, 'contextText'),
    }
  }

  private fieldState(snapshot: ConfigFormSnapshot<Record<string, unknown>>, field: FieldName): PrefaceFieldState {
    const staged = this.staged.get(field)
    if (staged === undefined) {
      return { text: format(field, sectionValue(snapshot, field)), overridden: stored(snapshot, field) }
    }
    const write = staged.clear ? { clear: true as const } : parse(field, staged.text)
    return {
      text: staged.text,
      overridden: write !== undefined && 'value' in write,
    }
  }

  /** Build the face the card's slot registration injects. */
  inject(): PrefaceCardFace & PrefaceCardActions {
    return {
      hooks: { prefaceCard: this.store },
      edit: (field, text) => { this.stage(field, { text, clear: false }) },
      resetField: (field) => {
        this.stage(field, { text: format(field, baseValue(this.scope.getSnapshot(), field)), clear: true })
      },
      save: () => { void this.save() },
      discard: () => {
        if (this.staged.size === 0 && !this.failed) return
        this.staged.clear()
        this.failed = false
        this.publish()
      },
    }
  }

  private stage(field: FieldName, edit: StagedEdit): void {
    this.staged.set(field, edit)
    this.failed = false
    this.publish()
  }

  private publish(): void {
    this.store.set(this.project())
  }

  /** Write every staged edit, then re-seed from what the Host accepted. */
  private async save(): Promise<void> {
    if (this.staged.size === 0 || this.saving) return
    this.saving = true
    this.failed = false
    this.publish()
    let landed = true
    for (const [field, staged] of this.staged) {
      const write = staged.clear ? { clear: true as const } : parse(field, staged.text)
      if (write === undefined) continue
      try {
        // `set`/`unset` resolve to whether the Host accepted the write; a
        // refusal (false) keeps the drafts for correction.
        const accepted = 'clear' in write
          ? await this.scope.unset(field)
          : await this.scope.set(field, write.value)
        if (!accepted) landed = false
      } catch {
        landed = false
      }
    }
    if (landed) this.staged.clear()
    this.saving = false
    this.failed = !landed
    this.publish()
  }
}
