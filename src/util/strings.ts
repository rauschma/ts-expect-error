export function removeSuffix(str: string, suffix: string): string {
  if (!str.endsWith(suffix)) {
    throw new Error(`String ${JSON.stringify(str)} does not have the suffix ${JSON.stringify(suffix)}`);
  }
  return str.slice(0, -suffix.length);
}

export function normalizeWhitespace(str: string) {
  return str.replace(/\s+/ug, ' ');
}
