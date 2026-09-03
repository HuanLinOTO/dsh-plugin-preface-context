import type { HostObservable, SnapshotSelectorHook } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * Bind a bare observable source to a typed uSES selector hook.
 * @param w - snapshot source (engine store, controller store instance).
 * @returns the selector hook.
 */
export declare function bindSnapshotSelector<T>(w: HostObservable<T>): SnapshotSelectorHook<T>;
