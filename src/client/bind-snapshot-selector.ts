/**
 * uSES bridge: turns any bare observable snapshot source into a typed
 * selector hook. Inlined here because `@deepseek-ai/dsh-client-ui-renderer`
 * does not re-export `bindSnapshotSelector` from its public `/client` face
 * (rc.8+); business plugins must provide their own copy.
 */
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector'
import type { HostObservable, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots'

/**
 * Bind a bare observable source to a typed uSES selector hook.
 * @param w - snapshot source (engine store, controller store instance).
 * @returns the selector hook.
 */
export function bindSnapshotSelector<T>(w: HostObservable<T>): SnapshotSelectorHook<T> {
  const subscribe = (fn: () => void) => w.subscribe(fn)
  const getSnapshot = () => w.getSnapshot()
  return function useSelector<S>(sel: (s: T) => S, eq?: (a: S, b: S) => boolean): S {
    return useSyncExternalStoreWithSelector(subscribe, getSnapshot, undefined, sel, eq)
  }
}
