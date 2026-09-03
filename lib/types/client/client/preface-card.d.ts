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
import { type ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PrefaceCardFace, PrefaceCardActions } from './preface-card-controller.ts';
/** Injected dependencies of the card (slot `inject`). */
export type PrefaceCardInjected = PrefaceCardFace & PrefaceCardActions;
/** Props the renderer binds for the card. */
export type PrefaceCardProps = PropsRuntime<'settings.plugin.item'> & PropsLocale<'settings.preface-context'> & InjectFace<PrefaceCardInjected>;
/**
 * Render the preface-context card.
 * @param props - locale copy, the card snapshot, and its form actions.
 * @returns the card, or nothing when the namespace is unavailable.
 */
export declare function PrefaceCard(props: PrefaceCardProps): ReactNode;
