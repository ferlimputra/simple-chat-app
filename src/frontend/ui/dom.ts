export const messagesEl = document.getElementById(
  "messages",
) as HTMLDivElement | null;
export const chatForm = document.getElementById(
  "chatForm",
) as HTMLFormElement | null;
export const inputEl = document.getElementById(
  "input",
) as HTMLTextAreaElement | null;
export const sendBtn = document.getElementById(
  "sendBtn",
) as HTMLButtonElement | null;
export const statusEl = document.getElementById(
  "status",
) as HTMLDivElement | null;

export function validateDOMElements(): void {
  if (!messagesEl || !chatForm || !inputEl || !sendBtn || !statusEl) {
    throw new Error("Missing required DOM elements");
  }
}
