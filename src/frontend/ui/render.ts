import { ChatMessage } from "../types.ts";
import { messagesEl, statusEl } from "./dom.ts";

function escapeForText(value: string): string {
  // DOM APIs use text nodes; this helper is just for readability.
  return value;
}

export function createMessageEl(msg: ChatMessage): HTMLDivElement {
  const el = document.createElement("div");
  el.className = `message message--${msg.role}`;
  el.textContent = escapeForText(msg.content);
  return el;
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
