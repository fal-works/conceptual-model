/**
 * Alias for `any` used only in type constraints.
 *
 * Purpose:
 * - Works as a generic boundary in `satisfies` / `extends` where `unknown` would
 *   be too strict (e.g., contravariant function params).
 * - Allows inference to narrow the actual type later.
 *
 * ⚠️ Use only in type boundaries, never for regular variables or parameters.
 */
// biome-ignore lint/suspicious/noExplicitAny: Used only for `satisfies` / `extends`
export type AnyBoundary = any;
