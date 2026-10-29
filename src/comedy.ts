import type { Workflow } from "./types";

export const actionRegistry = {
  open_thinknt: { label: "Open askinatot", text: "Think of someone. Let’s go." },
  hire_calculator: {
    label: "Hire New Calculator",
    text: "The interview went brilliantly.\n\nThe candidate only knows subtraction.\n\nWe are now offering less than the advertised salary.",
  },
  call_ceo: {
    label: "Escalate to CEO",
    text: "The fictional CEO opened your request.\n\nClosed it.\n\nAnnounced a bold new era of transparency: the office is now empty.",
  },
  study_plan: {
    label: "View Study Plan",
    text: "1. Open book.\n2. Stare at book.\n3. Close book.\n\nCongratulations. Academic atmosphere created.",
  },
  study_manager: {
    label: "Ask Study Manager",
    text: "The study manager recommends sleeping on it.\n\nSpecifically, on the textbook.\n\nKnowledge transfer is currently being investigated by the pillow.",
  },
  rubber_duck: {
    label: "Consult the Rubber Duck",
    text: "The rubber duck listened carefully.\n\nSaid nothing.\n\nFinally. A senior engineer who understands our culture.",
  },
  outsource: {
    label: "Outsource the Task",
    text: "Your refrigerator declined the fictional contract.\n\nIt already has a full plate.\n\nI have never respected an appliance more.",
  },
  appeal: {
    label: "Appeal This Decision",
    text: "Appeal accepted.\n\nI have reconsidered everything.\n\nSame outcome, but now with experience.",
  },
} as const;
export type ComedyActionId = keyof typeof actionRegistry;
export interface ComedyAction {
  id: ComedyActionId;
  label: string;
}
export function validAction(id: unknown): id is ComedyActionId {
  return (
    typeof id === "string" &&
    Object.prototype.hasOwnProperty.call(actionRegistry, id)
  );
}
export function actionWorkflow(id: unknown): Workflow | null {
  if (!validAction(id)) return null;
  return {
    intent: "general",
    acknowledgement: "A bold choice. Let’s see how this gets worse.",
    stages: [],
    text: actionRegistry[id].text,
    status: "Consequences successfully invented",
    strategy: "interactive",
    actions: [],
  };
}
