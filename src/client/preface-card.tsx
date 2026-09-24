/**
 * The preface-context configuration card: the flattened form on the plugin's
 * dedicated row page in the Plugins manager (`plugins.row.config`). Since dsh
 * 0.1.7 the slot renders on the row's own detail page (the page draws the
 * title, icon, breadcrumb, and description itself), so the card carries no
 * disclosure chrome of its own — the edit body (enable toggle, multiline
 * textarea, save/discard footer) is always expanded. Stages edits locally
 * and writes them on save through the bound {@link PrefaceCardController}.
 *
 * Styles come from the statically injected `preface-card.css` stylesheet (the
 * loader never serves `.css` artifacts); every color resolves through a
 * `--dsw-alias-*` token so the card adapts to the light/dark theme.
 */

import type { ReactNode } from 'react'
import clsx from 'clsx'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { css } from './preface-card.css.ts'
import type { PrefaceCardFace, PrefaceCardActions } from './preface-card-controller.ts'

/** Injected dependencies of the card (slot `inject`). */
export type PrefaceCardInjected = PrefaceCardFace & PrefaceCardActions

/** Props the renderer binds for the card. */
export type PrefaceCardProps =
  PropsRuntime<'plugins.row.config'>
  & PropsLocale<'settings.preface-context'>
  & InjectFace<PrefaceCardInjected>

/**
 * Render the preface-context card.
 * @param props - the requested view, locale copy, the card snapshot, and its form actions.
 * @returns the one-liner for `summary`, or the form for `page`.
 */
export function PrefaceCard(props: PrefaceCardProps): ReactNode {
  const { t } = props
  // The row page draws the title and description itself; `summary` is the
  // fallback one-liner the page shows when the row carries none.
  if (props.view === 'summary') return t('description')
  const state = props.usePrefaceCard(snapshot => snapshot)
  if (!state.available) return null
  const blocked = !state.dirty || state.saving
  const enabledOn = state.enabled.text === 'true'
  // The card is the row detail page's sole content, so the edit body renders
  // flat and always expanded — no card-level disclosure header.
  return (
    <div className={css.card}>
      <div className={css.body}>
        {!state.writable ? <p className={css.readOnly} role="status">{t('readOnly')}</p> : null}
        <div className={css.field}>
          <div className={css.head}>
            <label className={css.label}>{t('enabled')}</label>
            {state.enabled.overridden
              ? (
                <span className={css.badges}>
                  <span className={css.badge}>{t('overridden')}</span>
                  <button
                    type="button"
                    className={css.reset}
                    disabled={!state.writable}
                    onClick={() => { props.resetField('enabled') }}
                  >
                    {t('reset')}
                  </button>
                </span>
              )
              : null}
          </div>
          <div className={css.toggleRow}>
            <button
              type="button"
              role="switch"
              aria-checked={enabledOn}
              className={clsx(css.toggle, enabledOn && css.toggleOn)}
              disabled={!state.writable}
              onClick={() => { props.edit('enabled', enabledOn ? 'false' : 'true') }}
            >
              <span className={clsx(css.knob, enabledOn && css.knobOn)} />
            </button>
          </div>
          <p className={css.hint}>{t('enabledHint')}</p>
        </div>
        <div className={css.field}>
          <div className={css.head}>
            <label className={css.label}>{t('contextText')}</label>
            {state.contextText.overridden
              ? (
                <span className={css.badges}>
                  <span className={css.badge}>{t('overridden')}</span>
                  <button
                    type="button"
                    className={css.reset}
                    disabled={!state.writable}
                    onClick={() => { props.resetField('contextText') }}
                  >
                    {t('reset')}
                  </button>
                </span>
              )
              : null}
          </div>
          <textarea
            id="plugin-config-preface-context-text"
            className={css.textarea}
            value={state.contextText.text}
            placeholder={t('contextTextPlaceholder')}
            disabled={!state.writable}
            onChange={(event) => { props.edit('contextText', event.target.value) }}
          />
          <p className={css.hint}>{t('contextTextHint')}</p>
        </div>
        <div className={css.footer}>
          {state.dirty ? <span className={css.pending}>{t('unsaved')}</span> : null}
          {state.failed ? <p className={css.failed} role="status">{t('saveFailed')}</p> : null}
          <button
            type="button"
            className={css.discard}
            disabled={!state.dirty || state.saving}
            onClick={props.discard}
          >
            {t('discard')}
          </button>
          <button
            type="button"
            className={css.save}
            disabled={blocked}
            onClick={props.save}
          >
            {t(state.saving ? 'saving' : 'save')}
          </button>
        </div>
      </div>
    </div>
  )
}
