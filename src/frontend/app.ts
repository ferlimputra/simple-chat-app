type ChatRole = "user" | "assistant";

type ChatMessage = {
  role: ChatRole;
  content: string;
};

const messages: ChatMessage[] = [];

const maxContextMessages = 12;

function escapeForText(value: string) {
  // DOM APIs use text nodes; this helper is just for readability.
  return value;
}

const messagesEl = document.getElementById("messages") as HTMLDivElement | null;
const chatForm = document.getElementById("chatForm") as HTMLFormElement | null;
const inputEl = document.getElementById("input") as HTMLTextAreaElement | null;
const sendBtn = document.getElementById("sendBtn") as HTMLButtonElement | null;
const statusEl = document.getElementById("status") as HTMLDivElement | null;

if (!messagesEl || !chatForm || !inputEl || !sendBtn || !statusEl) {
  throw new Error("Missing required DOM elements");
}

function createMessageEl(msg: ChatMessage) {
  const el = document.createElement("div");
  el.className = `message message--${msg.role}`;
  el.textContent = escapeForText(msg.content);
  return el;
}

function renderMessages() {
  messagesEl.innerHTML = "";
  for (const msg of messages) {
    messagesEl.appendChild(createMessageEl(msg));
  }
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function setStatus(text: string, kind: "normal" | "error") {
  statusEl.textContent = text;
  statusEl.classList.toggle("status--error", kind === "error");
}

function getRequestMessages(nextUserMessage: ChatMessage) {
  return [...messages, nextUserMessage]
    .filter((message) => message.content.trim().length > 0)
    .slice(-maxContextMessages);
}

async function streamAssistantReply(requestMessages: ChatMessage[], assistantMessage: ChatMessage) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: requestMessages,
      stream: true,
    }),
    credentials: "same-origin",
  });

  if (!res.ok) {
    const errBody = (await res.json().catch(() => null)) as
      | { error?: string; message?: string }
      | null;
    const message = errBody?.message ?? errBody?.error ?? `Request failed (${res.status})`;
    throw new Error(message);
  }

  if (!res.body) {
    throw new Error("No response body");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const payload = JSON.parse(trimmed) as { token?: string; done?: boolean; error?: string };

      if (payload.error) {
        throw new Error(payload.error);
      }

      if (typeof payload.token === "string") {
        assistantMessage.content += payload.token;
        renderMessages();
      }
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const payload = JSON.parse(tail) as { token?: string; error?: string };
    if (payload.error) {
      throw new Error(payload.error);
    }
    if (typeof payload.token === "string") {
      assistantMessage.content += payload.token;
      renderMessages();
    }
  }
}

async function sendChat() {
  const content = inputEl.value.trim();
  if (!content) return;

  // Optimistically append the user message.
  const userMessage: ChatMessage = { role: "user", content };
  const assistantMessage: ChatMessage = { role: "assistant", content: "" };
  const requestMessages = getRequestMessages(userMessage);

  messages.push(userMessage);
  messages.push(assistantMessage);

  renderMessages();
  setStatus("Thinking...", "normal");

  inputEl.value = "";
  inputEl.disabled = true;
  sendBtn.disabled = true;

  try {
    await streamAssistantReply(requestMessages, assistantMessage);
    setStatus("Ready", "normal");
  } catch (err) {
    assistantMessage.content =
      err instanceof Error ? `Sorry: ${err.message}` : "Sorry: request failed.";
    renderMessages();
    setStatus("Request failed", "error");
  } finally {
    inputEl.disabled = false;
    sendBtn.disabled = inputEl.value.trim().length === 0;
    inputEl.focus();
  }
}

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

setStatus("Ready", "normal");

