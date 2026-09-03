/**
 * The preface-context settings card: a collapsible card on the "插件配置"
 * settings page. Renders an enable toggle and a multiline textarea for the
 * context text. Stages edits locally and writes them on save through the
 * bound {@link PrefaceCardController}.
 *
 * The chrome mirrors the upstream `PluginCard` shape (a header button
 * stacking name over description, a dirty pill, a rotating chevron; a body
 * with the form controls and a footer with Discard/Save) because the
 * upstream client value face exports no reusable card. Styles come from the
 * statically injected `preface-card.css` stylesheet (the loader never serves
 * `.css` artifacts); every color resolves through a `--dsw-alias-*` token so
 * the card adapts to the light/dark theme.
 */

import { useState, type ReactNode } from 'react'
import clsx from 'clsx'
import { IconChevronDownOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { css } from './preface-card.css.ts'
import type { PrefaceCardFace, PrefaceCardActions } from './preface-card-controller.ts'

/** Injected dependencies of the card (slot `inject`). */
export type PrefaceCardInjected = PrefaceCardFace & PrefaceCardActions

/** Props the renderer binds for the card. */
export type PrefaceCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'settings.preface-context'>
  & InjectFace<PrefaceCardInjected>

/**
 * Render the preface-context card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card, or nothing when the namespace is unavailable.
 */
export function PrefaceCard(props: PrefaceCardProps): ReactNode {
  const [open, setOpen] = useState(false)
  const { t } = props
  const state = props.usePrefaceCard(snapshot => snapshot)
  if (!state.available) return null
  const title = t('title')
  const blocked = !state.dirty || state.saving
  const enabledOn = state.enabled.text === 'true'
  return (
    <li className={clsx(css.card, open && css.cardOpen)}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${t(open ? 'collapse' : 'expand')}: ${title}`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{title}</span>
          <span className={css.description}>{t('description')}</span>
        </span>
        {state.dirty ? <span className={css.pending}>{t('unsaved')}</span> : null}
        <IconChevronDownOutline14 className={clsx(css.chevron, open && css.chevronOpen)} />
      </button>
      {open
        ? (
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
        )
        : null}
    </li>
  )
}
