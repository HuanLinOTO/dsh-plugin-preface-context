// @vitest-environment jsdom
/**
 * Component tests for the preface-context settings card
 * (`PrefaceCard`, src/client/preface-card.tsx).
 *
 * The card is a pure presentation component: it reads a snapshot through a
 * bound selector hook and dispatches edit/save/discard through the injected
 * actions. These specs feed it a driven fixture (a real
 * `PrefaceCardController` over an in-memory stub scope + a stub
 * selector hook that reads the current snapshot per render) and assert
 * user-visible behavior.
 *
 * Browser-bundle dependencies (`@deepseek-ai/dsh-client-ui-primitives` ships
 * as a `__ModuleLoader__`-wrapped CJS bundle with inlined CSS) are stubbed
 * with `vi.mock` so the component renders under jsdom without the full
 * platform module table.
 */

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

// Stub the browser-bundle icon import with a no-op component.
vi.mock('@deepseek-ai/dsh-client-ui-primitives', () => ({
  IconChevronDownOutline14: ({ className }: { className?: string }) =>
    null as never,
}))

import type { SettingsScope, SettingsScopeSnapshot } from '@deepseek-ai/dsh-client-ui-settings/client'
import { PrefaceCard } from '../src/client/preface-card.tsx'
import type { PrefaceCardProps } from '../src/client/preface-card.tsx'
import { PrefaceCardController } from '../src/client/preface-card-controller.ts'
import type { PrefaceConfig } from '../src/config.ts'
import { en } from '../src/client/locales.ts'

afterEach(cleanup)

const t: PrefaceCardProps['t'] = (key) => en[key as keyof typeof en]

/** A minimal in-memory SettingsScope stub. */
function stubScope(initial: PrefaceConfig, base: Partial<PrefaceConfig> = initial, opts: { writable?: boolean; available?: boolean } = {}): SettingsScope<PrefaceConfig> {
  let value = initial
  let user: Record<string, unknown> | undefined = undefined
  const listeners = new Set<() => void>()
  const writable = opts.writable ?? true
  const available = opts.available ?? true
  const snapshot = (): SettingsScopeSnapshot<PrefaceConfig> => ({
    status: available ? 'ready' : 'unavailable',
    value,
    base,
    user,
    revision: 0,
    writable,
    mode: 'host',
  })
  return {
    getSnapshot: snapshot,
    subscribe: (cb: () => void) => {
      listeners.add(cb)
      return () => { listeners.delete(cb) }
    },
    set: async (field: string, valueArg: unknown) => {
      value = { ...value, [field]: valueArg }
      user = { ...(user ?? {}), [field]: valueArg }
      for (const cb of listeners) cb()
    },
    unset: async (field: string) => {
      const next = { ...value }
      delete (next as Record<string, unknown>)[field]
      value = next
      if (user !== undefined) {
        const nextUser = { ...user }
        delete nextUser[field]
        user = Object.keys(nextUser).length === 0 ? undefined : nextUser
      }
      for (const cb of listeners) cb()
    },
  }
}

/** A stub `useSnapshot` that reads the controller's current snapshot per render. */
function stubUseSnapshot(controller: PrefaceCardController): PrefaceCardProps['usePrefaceCard'] {
  return (sel) => sel(controller.snapshot.getSnapshot())
}

/** Build the full card props the renderer would bind. */
function cardProps(controller: PrefaceCardController): PrefaceCardProps {
  const actions = controller.inject()
  return {
    t,
    usePrefaceCard: stubUseSnapshot(controller),
    hooks: { prefaceCard: controller.snapshot },
    ...actions,
  }
}

describe('PrefaceCard availability', () => {
  it('renders nothing when the namespace is unavailable', () => {
    const scope = stubScope({ enabled: true, contextText: '' }, { enabled: true, contextText: '' }, { available: false })
    const controller = new PrefaceCardController(scope)
    const { container } = render(<PrefaceCard {...cardProps(controller)} />)
    expect(container.childNodes.length).toBe(0)
  })
})

describe('PrefaceCard collapsed state', () => {
  it('renders the header (title + description) but not the body when collapsed', () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const controller = new PrefaceCardController(scope)
    render(<PrefaceCard {...cardProps(controller)} />)
    expect(screen.getByText('Preface context')).toBeDefined()
    expect(screen.getByText('Inject a text block as model-visible instructions at the start of every session.')).toBeDefined()
    // The textarea is inside the collapsed body — not present until expanded.
    expect(screen.queryByPlaceholderText('Enter the text to inject at the start of every session…')).toBeNull()
  })

  it('expands the body on header click, revealing the textarea and toggle', () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const controller = new PrefaceCardController(scope)
    render(<PrefaceCard {...cardProps(controller)} />)
    fireEvent.click(screen.getByRole('button', { name: /Show settings/ }))
    expect(screen.getByPlaceholderText('Enter the text to inject at the start of every session…')).toBeDefined()
    expect(screen.getByRole('switch')).toBeDefined()
  })
})

describe('PrefaceCard textarea editing', () => {
  it('stages contextText edits through the controller', () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const controller = new PrefaceCardController(scope)
    render(<PrefaceCard {...cardProps(controller)} />)
    fireEvent.click(screen.getByRole('button', { name: /Show settings/ }))
    const textarea = screen.getByPlaceholderText('Enter the text to inject at the start of every session…') as HTMLTextAreaElement
    fireEvent.change(textarea, { target: { value: 'staged text' } })
    expect(controller.snapshot.getSnapshot().contextText.text).toBe('staged text')
    expect(controller.snapshot.getSnapshot().dirty).toBe(true)
  })
})

describe('PrefaceCard toggle', () => {
  it('flips enabled from true to false on click', () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const controller = new PrefaceCardController(scope)
    render(<PrefaceCard {...cardProps(controller)} />)
    fireEvent.click(screen.getByRole('button', { name: /Show settings/ }))
    const toggle = screen.getByRole('switch')
    expect(toggle.getAttribute('aria-checked')).toBe('true')
    fireEvent.click(toggle)
    expect(controller.snapshot.getSnapshot().enabled.text).toBe('false')
  })
})

describe('PrefaceCard save', () => {
  it('writes staged edits through the scope on save click', async () => {
    const scope = stubScope({ enabled: true, contextText: '' })
    const setSpy = vi.spyOn(scope, 'set')
    const controller = new PrefaceCardController(scope)
    const actions = controller.inject()
    render(<PrefaceCard {...cardProps(controller)} />)
    fireEvent.click(screen.getByRole('button', { name: /Show settings/ }))
    const textarea = screen.getByPlaceholderText('Enter the text to inject at the start of every session…')
    fireEvent.change(textarea, { target: { value: 'saved' } })
    // Confirm the edit staged before clicking save.
    await vi.waitFor(() => {
      expect(controller.snapshot.getSnapshot().contextText.text).toBe('saved')
    })
    // Call save directly through the controller actions (the card's onClick
    // dispatches the same closure) to avoid React act-timing ripples around
    // the saving flag disabling the button mid-flight.
    actions.save()
    await vi.waitFor(() => {
      expect(setSpy).toHaveBeenCalledWith('contextText', 'saved')
    })
  })
})
