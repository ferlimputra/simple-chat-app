import DOMPurify from "dompurify";
import { marked } from "marked";

/**
 * Parses markdown string to sanitized HTML
 * @param markdown - Markdown content to parse
 * @returns Promise of sanitized HTML string safe for use in innerHTML
 */
export async function parseMarkdownToHtml(markdown: string): Promise<string> {
  const html = await marked(markdown);
  return DOMPurify.sanitize(html);
}

/**
 * Creates a DOM element with markdown content rendered as HTML
 * @param markdown - Markdown content to render
 * @returns Promise of HTMLDivElement with rendered markdown
 */
export async function createMarkdownElement(
  markdown: string,
): Promise<HTMLDivElement> {
  const el = document.createElement("div");
  el.className = "markdown-body";
  el.innerHTML = await parseMarkdownToHtml(markdown);
  return el;
}
