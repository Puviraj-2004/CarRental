export function replaceToken(text: string, token: string, value: string): string {
  return text.replace(token, value);
}

export function replaceTokens(text: string, values: Record<string, string | number>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value)),
    text
  );
}
