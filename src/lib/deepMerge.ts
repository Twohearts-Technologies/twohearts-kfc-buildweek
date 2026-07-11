// Shared deep-merge helper. Mirrors the merge semantics used by
// src/hooks/useContent.ts so the /edit editor hydrates a fetched
// (possibly partial) content payload over the bundled defaults in
// exactly the same way the public page does. Matching arrays replace
// wholesale, matching primitives replace, and plain objects merge recursively.

export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    const targetValue = target[key];

    if (sourceValue === null) continue;

    const sourceIsArray = Array.isArray(sourceValue);
    const targetIsArray = Array.isArray(targetValue);
    const sourceIsObject = typeof sourceValue === "object" && !sourceIsArray;
    const targetIsObject =
      targetValue !== null && typeof targetValue === "object" && !targetIsArray;

    if (sourceIsObject && targetIsObject) {
      result[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      );
    } else if (
      (sourceIsArray && targetIsArray) ||
      (!sourceIsArray && !sourceIsObject && !targetIsArray && !targetIsObject)
    ) {
      result[key] = sourceValue;
    }
  }

  return result;
}
