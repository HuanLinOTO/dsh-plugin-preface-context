/**
 * Config schema for the preface-context plugin (Schemastery, strict).
 *
 * The plugin-row config (the `entry` passed to `apply`) is the composition
 * BASE of the `preface-context` settings namespace. The settings user layer
 * is layered on top (schema defaults → base → user layer) when a settings
 * service is mounted; without one, the entry is the sole source.
 *
 * @module @huanlin/dsh-plugin-preface-context/config
 */
import z from 'schemastery';
/**
 * Schemastery schema for the `preface-context` settings namespace.
 *
 * Strict by construction: unknown keys fail validation here, even though the
 * settings service itself is non-strict and would otherwise accept them.
 */
export const Config = z.object({
    enabled: z.boolean().default(true),
    contextText: z.string().default(''),
});
/** Known config keys (for strict unknown-key rejection). */
const CONFIG_KEYS = new Set(['enabled', 'contextText']);
/**
 * Resolve a raw config patch through the schema, returning a full
 * {@link PrefaceConfig} with defaults applied. Unknown keys are rejected
 * here (the settings service itself is non-strict and would otherwise accept
 * them), matching the Loader's strict validation.
 * @param input - a partial or complete config object.
 * @returns the schema-resolved config.
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
    return Config(input);
}
