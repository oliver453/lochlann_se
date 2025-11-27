export function parseMarkdown(text: string): string {
    // Konvertera **text** till <strong>text</strong>
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  }