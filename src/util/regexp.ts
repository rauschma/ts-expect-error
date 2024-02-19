export function globalizeRegExp(regExp: RegExp) {
  let source = regExp.source;
  if (source.startsWith('^')) {
    source = source.slice(1);
  }
  let flags = regExp.flags;
  if (!flags.includes('g')) {
    flags += 'g';
  }
  return new RegExp(source, flags);
}
