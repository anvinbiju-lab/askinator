import { validAction, actionRegistry } from "./comedy";
import type { AppState, ChatMessage } from "./types";
import { freshState } from "./engine";
export const STORAGE_KEY = "worknt.workspace.v1";
const count = (v: unknown) =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
export function loadState(): AppState {
  try {
    const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (!s || s.version !== 1 || !Array.isArray(s.conversations))
      return freshState();
    const defaults = freshState();
    defaults.conversations = s.conversations.filter(
      (c: any) =>
        c &&
        typeof c.id === "string" &&
        typeof c.title === "string" &&
        ["chat", "council", "meeting"].includes(c.kind) &&
        Array.isArray(c.messages) &&
        c.messages.every(
          (m: ChatMessage) =>
            m &&
            typeof m.text === "string" &&
            typeof m.id === "string" &&
            ["user", "assistant"].includes(m.role) &&
            count(m.at) &&
            (m.stages === undefined ||
              (Array.isArray(m.stages) &&
                m.stages.every((x) => typeof x === "string"))) &&
            (m.council === undefined ||
              (Array.isArray(m.council) &&
                m.council.every(
                  (x) =>
                    x &&
                    Number.isInteger(x.agent) &&
                    x.agent >= 0 &&
                    x.agent < 4 &&
                    typeof x.text === "string",
                ))),
        ),
    );
    defaults.conversations = defaults.conversations.map((c) => {
      c = {
        ...c,
        messages: c.messages.map((m) => ({
          ...m,
          actions: Array.isArray(m.actions)
            ? m.actions
                .filter((a) => a && validAction(a.id))
                .map((a) => ({ id: a.id, label: actionRegistry[a.id].label }))
            : [],
          usedActions: Array.isArray(m.usedActions)
            ? m.usedActions.filter(validAction)
            : [],
          jokeId: typeof m.jokeId === "string" ? m.jokeId : undefined,
          comedySubject:
            typeof m.comedySubject === "string" ? m.comedySubject : undefined,
          strategy: typeof m.strategy === "string" ? m.strategy : undefined,
          setup: typeof m.setup === "string" ? m.setup : undefined,
        })),
      };
      const last = c.messages.at(-1);
      if (last?.role !== "user") return c;
      return {
        ...c,
        messages: [
          ...c.messages,
          {
            id: `${last.id}-interrupted`,
            role: "assistant" as const,
            at: Date.now(),
            text:
              c.kind === "chat"
                ? "My reply got interrupted when the page closed. Ask me again, bro?"
                : "This fictional workflow was interrupted when the workspace closed. No avoidance was recorded. Submit the request again whenever you’re ready to resume doing nothing.",
            status: "Workflow interrupted · safe to retry",
          },
        ],
      };
    });
    if (
      s.metrics &&
      ["received", "avoided", "milliseconds", "council", "coding"].every((k) =>
        count(s.metrics[k]),
      )
    )
      defaults.metrics = {
        ...s.metrics,
        history: Array.isArray(s.metrics.history)
          ? s.metrics.history
              .filter((h: any) => h && count(h.at) && count(h.avoided))
              .slice(-60)
          : [],
      };
    defaults.settings = {
      language: s.settings?.language === "ml" ? "ml" : "en",
      reducedMotion: s.settings?.reducedMotion === true,
      chaos: s.settings?.chaos !== false,
    };
    defaults.unlocked = Array.isArray(s.unlocked)
      ? s.unlocked.filter((a: unknown) => typeof a === "string")
      : [];
    defaults.sessionTasks = count(s.sessionTasks) ? s.sessionTasks : 0;
    defaults.insistence = count(s.insistence) ? s.insistence : 0;
    return defaults;
  } catch {
    return freshState();
  }
}
