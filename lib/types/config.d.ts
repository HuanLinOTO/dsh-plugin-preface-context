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
/** User-editable configuration for the preface-context plugin. */
export interface PrefaceConfig {
    /** Master switch: when false, no context is injected at session start. */
    enabled: boolean;
    /** The text block injected as model-visible instructions context. */
    contextText: string;
}
/**
 * Schemastery schema for the `preface-context` settings namespace.
 *
 * Strict by construction: unknown keys fail validation here, even though the
 * settings service itself is non-strict and would otherwise accept them.
 */
export declare const Config: import("@deepseek-ai/schemastery").default<Schemastery.ObjectS<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean>;
    contextText: import("@deepseek-ai/schemastery").default<string, string>;
}>, Schemastery.ObjectT<{
    enabled: import("@deepseek-ai/schemastery").default<boolean, boolean>;
    contextText: import("@deepseek-ai/schemastery").default<string, string>;
}>>;
/**
 * Resolve a raw config patch through the schema, returning a full
 * {@link PrefaceConfig} with defaults applied. Unknown keys are rejected
 * here (the settings service itself is non-strict and would otherwise accept
 * them), matching the Loader's strict validation.
 * @param input - a partial or complete config object.
 * @returns the schema-resolved config.
 * @throws when the input carries an unknown key or a value the schema rejects.
 */
export declare function resolvePrefaceConfig(input: Partial<PrefaceConfig>): PrefaceConfig;
