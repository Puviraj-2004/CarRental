/**
 * Sanitize error messages for user display.
 *
 * Apollo GraphQL errors from our backend (AppError) contain safe,
 * human-readable messages. Other errors may contain stack traces,
 * internal paths, or system details that should NOT be exposed.
 *
 * This utility checks if the error originates from Apollo (graphQLErrors)
 * and returns the message. For all other errors, it returns a generic fallback.
 */

interface ApolloLikeError {
  graphQLErrors?: Array<{ message: string }>;
  networkError?: Error | null;
  message?: string;
}

/**
 * Extract a user-safe error message.
 *
 * @param error    - The caught error object
 * @param fallback - A translated fallback string (e.g. t('errors.generic'))
 * @returns A safe string to display to the user
 */
export function getSafeErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;

  // Apollo GraphQL errors — messages come from our backend AppError (safe)
  const apolloErr = error as ApolloLikeError;
  if (apolloErr.graphQLErrors && apolloErr.graphQLErrors.length > 0) {
    return apolloErr.graphQLErrors[0].message || fallback;
  }

  // Network errors — don't expose internals
  if (apolloErr.networkError) {
    return fallback;
  }

  // Generic Error with a message — only show if it looks like a user-facing message
  // (no stack traces, no file paths, no "Cannot read property" etc.)
  if (error instanceof Error && error.message) {
    const msg = error.message;
    // Block messages that leak internals
    const unsafeKeywords = [
      'cannot read prop',
      'undefined is not',
      'is not a function',
      'unexpected token',
      'syntax error',
      'econnrefused',
      'etimedout',
      'node_modules',
      'webpack',
    ];
    const lowerMsg = msg.toLowerCase();
    const hasStackTrace = /at\s+\S+\s+\(/.test(msg);
    const hasFilePath = /\.\w+:\d+/.test(msg);
    if (unsafeKeywords.some((kw) => lowerMsg.includes(kw)) || hasStackTrace || hasFilePath) {
      return fallback;
    }
    return msg;
  }

  return fallback;
}
