/**
 * Node by default; `tests/*.spec.tsx` that need a DOM opt into jsdom with
 * their own `@vitest-environment` pragma, which keeps the environment
 * choice next to the test that needs it.
 *
 * CSS imports are stubbed (return an empty object) so component specs can
 * import `.module.css` files without a real CSS pipeline — the specs assert
 * behavior, not class names.
 */
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    css: false,
  },
})
