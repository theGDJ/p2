export function parseStandardCode(value: string) {
  const code = value.toUpperCase().replace(/\(\s*PART\s*(\d+)\s*\)/g, "-$1").replace(/\s+/g, "");
  const match = code.match(/^IS(\d{2,6})((?:-\d+)*)(?::(\d{4}))?$/);
  return match ? { number: match[1], parts: match[2], year: match[3] ?? null } : null;
}

/** A label without a part/year identifies a family, not an exact edition. */
export function matchesStandardCode(label: string, catalogueCode: string): boolean {
  const query = parseStandardCode(label);
  const record = parseStandardCode(catalogueCode);
  return !!query && !!record && query.number === record.number
    && (!query.parts || query.parts === record.parts)
    && (!query.year || query.year === record.year);
}
