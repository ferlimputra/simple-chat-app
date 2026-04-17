import { streamAssistantReply } from "../api/client.ts";
import { addMessage, getRequestMessages, messages } from "../state.ts";
import { ChatMessage } from "../types.ts";
import { chatForm, inputEl, sendBtn } from "./dom.ts";
import { renderMessages, setStatus } from "./render.ts";

async function sendChat(): Promise<void> {
  if (!inputEl || !sendBtn || !chatForm) return;

  const content = inputEl.value.trim();
  if (!content) return;

  // Optimistically append the user message.
  const userMessage: ChatMessage = { role: "user", content };
  const assistantMessage: ChatMessage = { role: "assistant", content: "" };
  const requestMessages = getRequestMessages(userMessage);

  addMessage(userMessage);
  addMessage(assistantMessage);

  renderMessages(messages);
  setStatus("Thinking...", "normal");

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;

  try {
    await streamAssistantReply(requestMessages, assistantMessage, () => {
      renderMessages(messages);
    });
    setStatus("Ready", "normal");
  } catch (err) {
    assistantMessage.content =
      err instanceof Error ? `Sorry: ${err.message}` : "Sorry: request failed.";
    renderMessages(messages);
    setStatus("Request failed", "error");
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = inputEl.value.trim().length === 0;
    inputEl.focus();
  }
}

export function setupEventHandlers(): void {
  if (!inputEl || !sendBtn || !chatForm) return;

  inputEl.addEventListener("input", () => {
    sendBtn.disabled = inputEl.value.trim().length === 0 || inputEl.disabled;
  });

  chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    void sendChat();
  });

  // Enable Ctrl+Enter to submit quickly.
  inputEl.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      void sendChat();
    }
  });
}
