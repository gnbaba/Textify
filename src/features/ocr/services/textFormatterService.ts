export function formatText(text: string): string {
  return text.trim().replace(/\n{2,}/g, '\n');
}
