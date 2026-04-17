import { ChatMessage } from "../types.ts";
import { createMarkdownElement } from "../utils/markdown.ts";
import { messagesEl, statusEl } from "./dom.ts";

function escapeForText(value: string): string {
  // DOM APIs use text nodes; this helper is just for readability.
  return value;
}

export function createMessageEl(msg: ChatMessage): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = `message message--${msg.role}`;

  if (msg.role === "assistant") {
    // Render assistant messages as markdown
    const mdElement = createMarkdownElement(msg.content);
    wrapper.appendChild(mdElement);
  } else {
    // Render user messages as plain text
    wrapper.textContent = escapeForText(msg.content);
  }

  return wrapper;
}

export function renderMessages(messages: ChatMessage[]): void {
  if (!messagesEl) return;

  messagesEl.innerHTML = "";
  for (const msg of messages) {
    messagesEl.appendChild(createMessageEl(msg));
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

export function setStatus(text: string, kind: "normal" | "error"): void {
  if (!statusEl) return;

  statusEl.textContent = text;
  statusEl.classList.toggle("status--error", kind === "error");
}
