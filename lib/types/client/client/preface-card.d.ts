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
import type { ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PrefaceCardFace, PrefaceCardActions } from './preface-card-controller.ts';
/** Injected dependencies of the card (slot `inject`). */
export type PrefaceCardInjected = PrefaceCardFace & PrefaceCardActions;
/** Props the renderer binds for the card. */
export type PrefaceCardProps = PropsRuntime<'plugins.row.config'> & PropsLocale<'settings.preface-context'> & InjectFace<PrefaceCardInjected>;
/**
 * Render the preface-context card.
 * @param props - the requested view, locale copy, the card snapshot, and its form actions.
 * @returns the one-liner for `summary`, or the form for `page`.
 */
export declare function PrefaceCard(props: PrefaceCardProps): ReactNode;
