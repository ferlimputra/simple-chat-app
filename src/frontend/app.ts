import { validateDOMElements } from "./ui/dom.ts";
import { setupEventHandlers } from "./ui/handlers.ts";
import { setStatus } from "./ui/render.ts";

// Validate that all required DOM elements exist
validateDOMElements();

// Setup event listeners
setupEventHandlers();

// Initialize the UI
setStatus("Ready", "normal");
