/**
 * uSES bridge: turns any bare observable snapshot source into a typed
 * selector hook. Inlined here because `@deepseek-ai/dsh-client-ui-renderer`
 * does not re-export `bindSnapshotSelector` from its public `/client` face
 * (rc.8+); business plugins must provide their own copy.
 */
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/shim/with-selector';
/**
 * Bind a bare observable source to a typed uSES selector hook.
 * @param w - snapshot source (engine store, controller store instance).
 * @returns the selector hook.
 */
export function bindSnapshotSelector(w) {
    const subscribe = (fn) => w.subscribe(fn);
    const getSnapshot = () => w.getSnapshot();
    return function useSelector(sel, eq) {
        return useSyncExternalStoreWithSelector(subscribe, getSnapshot, undefined, sel, eq);
    };
}
