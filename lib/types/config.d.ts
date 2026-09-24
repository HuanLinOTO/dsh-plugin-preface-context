/**
 * Config schema for the preface-context plugin (Schemastery, strict).
 *
 * Since dsh 0.1.7-rc.1 every configurable value lives in the plugin's own
 * Cordis Config: the profile-owned value is persisted in `cordis.patch.yml`
 * under this plugin's profile entry id, and the fields a settings form may
 * edit are declared `.volatile()` so a live edit updates the running instance
 * without a remount. `apply` receives {@link PrefaceEntryConfig} (the volatile
 * references) and reads them through `.get()` at session start.
 *
 * @module @huanlin/dsh-plugin-preface-context/config
 */
import z from '@deepseek-ai/schemastery';
import type { Volatile } from '@deepseek-ai/cordis';
/** User-editable configuration values for the preface-context plugin. */
export interface PrefaceConfig {
    /** Master switch: when false, no context is injected at session start. */
    enabled: boolean;
    /** The text block injected as model-visible instructions context. */
    contextText: string;
}
/**
 * The plugin-row Config the Loader resolves for `apply`: each editable field is
 * a volatile reference (`Volatile<T>`) read through `.get()`, so a profile edit
 * reaches the running instance without remounting it.
 */
export interface PrefaceEntryConfig {
    /** Master switch; read with `.get()` at session start. */
    enabled: Volatile<boolean>;
    /** The injected text block; read with `.get()` at session start. */
    contextText: Volatile<string>;
}
/**
 * Schemastery schema for the plugin's profile-owned Config.
 *
 * Strict by construction: unknown keys fail validation in the Loader. The
 * `.volatile()` fields are the ones the plugin-manager configuration form may
 * edit.
 */
export declare const Config: z<{
    enabled?: boolean;
    contextText?: string;
}, PrefaceEntryConfig>;
/**
 * Resolve a raw config patch through the schema, returning full plain
 * {@link PrefaceConfig} values with defaults applied. Unknown keys are
 * rejected here so the helper keeps its strict contract in tests and callers
 * that resolve a detached patch.
 * @param input - a partial or complete config object.
 * @returns the schema-resolved plain config.
 * @throws when the input carries an unknown key or a value the schema rejects.
 */
export declare function resolvePrefaceConfig(input: Partial<PrefaceConfig>): PrefaceConfig;
