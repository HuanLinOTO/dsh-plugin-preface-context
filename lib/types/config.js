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
/**
 * Schemastery schema for the plugin's profile-owned Config.
 *
 * Strict by construction: unknown keys fail validation in the Loader. The
 * `.volatile()` fields are the ones the plugin-manager configuration form may
 * edit.
 */
export const Config = z.object({
    enabled: z.boolean().default(true).volatile(),
    contextText: z.string().default('').volatile(),
});
/** Known config keys (for strict unknown-key rejection in {@link resolvePrefaceConfig}). */
const CONFIG_KEYS = new Set(['enabled', 'contextText']);
/**
 * Resolve a raw config patch through the schema, returning full plain
 * {@link PrefaceConfig} values with defaults applied. Unknown keys are
 * rejected here so the helper keeps its strict contract in tests and callers
 * that resolve a detached patch.
 * @param input - a partial or complete config object.
 * @returns the schema-resolved plain config.
 * @throws when the input carries an unknown key or a value the schema rejects.
 */
export function resolvePrefaceConfig(input) {
    if (input !== null && typeof input === 'object' && !Array.isArray(input)) {
        for (const key of Object.keys(input)) {
            if (!CONFIG_KEYS.has(key)) {
                throw new Error(`preface-context: unknown config key "${key}"`);
            }
        }
    }
    const parsed = Config(input);
    return { enabled: parsed.enabled.get(), contextText: parsed.contextText.get() };
}
