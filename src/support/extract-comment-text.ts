import { InternalError } from '../util/errors.js';
import { globalizeRegExp } from '../util/regexp.js';
import { normalizeWhitespace } from '../util/strings.js';

export const RE_TS_EXPECT_ERROR_PREFIX = /^\/\/ *%ts-expect-error:/u;
export const RE_TS_EXPECT_ERROR_PREFIX_G = globalizeRegExp(RE_TS_EXPECT_ERROR_PREFIX);

export function extractCommentText(commentParts: Array<string>, prefixRegExp: RegExp): null | string {
  for (const [index, commentPart] of commentParts.entries()) {
    const match = prefixRegExp.exec(commentPart);
    if (match) {
      const indexAfterPrefix = match.index + match[0].length;
      const startText = commentPart.slice(indexAfterPrefix);
      return extractTextFromParts(startText, commentParts, index + 1);
    }
  }
  return null;
}

const COMMENT_PREFIX = '//';
function extractTextFromParts(startText: string, commentParts: Array<string>, startIndex: number) {
  if (commentParts.length < 1) {
    throw new InternalError(JSON.stringify(commentParts));
  }
  let commentText = startText;
  for (let i = startIndex; i < commentParts.length; i++) {
    const part = commentParts[i];
    if (!part.startsWith(COMMENT_PREFIX)) {
      throw new InternalError(JSON.stringify(commentParts));
    }
    commentText += part.slice(COMMENT_PREFIX.length);
  }
  commentText = normalizeWhitespace(commentText.trim());
  return commentText;
}
