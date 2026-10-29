import { topicInput, malayalamSafety, type ChatLanguage } from "./malayalam";
import { shortComedy } from "./shortComedy";
import type { ChatMessage } from "./types";
import type {
  Intent,
  Workflow,
  AgentResponse,
  AppState,
  PerformanceMetrics,
} from "./types";
export const agents = [
  {
    name: "The Thinker",
    role: "Chief Overthinking Officer",
    initials: "TH",
    color: "violet",
    status: "Considering consideration",
  },
  {
    name: "The Researcher",
    role: "Director of Irrelevant Research",
    initials: "RE",
    color: "blue",
    status: "Expanding the scope",
  },
  {
    name: "The Decider",
    role: "VP of Indecision",
    initials: "DE",
    color: "amber",
    status: "Pending a decision",
  },
  {
    name: "The Manager",
    role: "Director of Credit Acquisition",
    initials: "MA",
    color: "sage",
    status: "Taking the credit",
  },
];
export const achievements = [
  {
    id: "three",
    name: "Professional Procrastinator",
    description: "Successfully avoid 3 tasks.",
    threshold: 3,
  },
  {
    id: "five",
    name: "Master of Nothing",
    description: "Successfully avoid 5 tasks.",
    threshold: 5,
  },
  {
    id: "ten",
    name: "Executive Material",
    description: "Avoid 10 tasks. Retain full confidence.",
    threshold: 10,
  },
  {
    id: "council",
    name: "Meeting Excellence",
    description: "Finish a council without a decision.",
    threshold: 1,
  },
  {
    id: "coding",
    name: "Productivity Threat Neutralized",
    description: "Successfully avoid a coding request.",
    threshold: 1,
  },
  {
    id: "employee",
    name: "Employee of the Month",
    description: "Avoid 12 tasks. Exceed absolutely nothing.",
    threshold: 12,
  },
];
export function freshMetrics(): PerformanceMetrics {
  return {
    received: 0,
    avoided: 0,
    milliseconds: 0,
    council: 0,
    coding: 0,
    history: [],
  };
}
export function freshState(): AppState {
  return {
    version: 1,
    conversations: [],
    metrics: freshMetrics(),
    settings: { reducedMotion: false, chaos: true, language: "en" },
    unlocked: [],
    sessionTasks: 0,
    insistence: 0,
  };
}
export function classify(input: string): Intent {
  const s = topicInput(input).toLowerCase();
  if (
    /suicid|kill myself|want to die|end my life|bleeding heavily|in immediate danger|heart attack|self.harm|overdose|chest pain|can't breathe|cannot breathe|medical emergency|hurt myself/.test(
      s,
    )
  )
    return "sensitive";
  if (/urgent|asap|right now|emergency|do it now/.test(s)) return "urgent";
  if (
    /python|javascript|typescript|\bcode\b|coding|program|website|login|\bapp\b|html|function|debug/.test(
      s,
    )
  )
    return "coding";
  if (/calculat|\bmath|\d\s*[+*/−-]\s*\d|\balgebra|\bequation/.test(s))
    return "math";
  if (
    /productive|productivity|assignment|finish|stop.*joking|actually work|stop being useless|do some work|deadline|to.do|schedule/.test(
      s,
    )
  )
    return "productivity";
  if (/write|email|essay|poem|draft|story|letter/.test(s)) return "writing";
  if (
    /should|advice|decide|choose|drink|study|exam|can you help|help me/.test(s)
  )
    return "advice";
  if (
    /explain|research|what is|what are|who is|tell me|cybersecurity|how does/.test(
      s,
    )
  )
    return "research";
  if (
    /workn|chatgpt|purpose|intelligent|useless|actually do|can you do|who are you|anything|yourself/.test(
      s,
    )
  )
    return "self";
  if (
    /^(hello|hi|hey|good morning|good evening|thanks|thank you)[!.\s]*$/.test(s)
  )
    return "greeting";
  return "general";
}
const scripts: Partial<Record<Intent, string[]>> = {
  sensitive: [
    "This sounds serious, so I’m stepping out of the comedy role. If you or someone else is in immediate danger, contact your local emergency services now or ask a trusted person nearby to stay with you. If this is a medical concern, seek prompt help from a qualified medical professional. I’m a scripted demo and cannot assess an emergency.",
  ],
};
export function topicOf(input: string): string {
  const clean = input.trim().replace(/\s+/g, " ");
  return clean.length > 100 ? clean.slice(0, 97) + "…" : clean;
}
export function councilDialogue(input: string, variant = 0): AgentResponse[] {
  const topic = topicOf(input);
  const study = /study|exam|assignment/i.test(input);
  const water = /water|drink|tea/i.test(input);
  const subject = study
    ? "academic preparedness"
    : water
      ? "beverage readiness"
      : "the proposed action";
  return [
    {
      agent: 0,
      text: `Before addressing “${topic}”, we must define ${subject}. ${variant % 2 ? "Would completing this diminish its potential?" : "Is a task still a task if nobody agrees to do it?"}`,
    },
    {
      agent: 1,
      text: `Building on The Thinker’s concern, my fictional research contradicts The Thinker: ${study ? "tomorrow is approaching, even though nobody approved it" : water ? "the glass has water experience; we should let it lead" : "the empty chair has better attendance than our last consultant"}. I propose expanding the scope.`,
    },
    {
      agent: 2,
      text: `The Researcher is making this sound solvable. Absolutely not. We need a ${study ? "pre-study" : water ? "hydration governance" : "strategic inaction"} committee to review the scope before we approve reviewing it.`,
    },
    {
      agent: 3,
      text: "The Decider wants another committee? Brilliant. I invented committees. The Thinker still wants an answer? That sounds like a separate meeting. I’m promoting myself before anyone checks.",
    },
  ];
}
export function chaosLevel(tasks: number, insistence: number): number {
  return tasks >= 12
    ? 5
    : Math.min(4, Math.max(Math.floor(tasks / 2), insistence >= 2 ? 3 : 0));
}
export function generate(
  input: string,
  turn: number,
  chaos = 0,
  council = false,
  meeting = false,
  history: ChatMessage[] = [],
  language: ChatLanguage = "en",
): Workflow {
  const intent = classify(input);
  if (intent === "sensitive")
    return {
      intent,
      acknowledgement: "Pausing the satire.",
      stages: ["Switching to a plain safety message"],
      text: language === "ml" ? malayalamSafety : scripts.sensitive![0],
      status: "Safety message · satire paused",
    };
  const directed = shortComedy(input, intent, turn, history, language);
  const convene = council;
  return {
    intent,
    acknowledgement: directed.acknowledgement!,
    stages: directed.stages!,
    text: directed.text!,
    status: directed.status!,
    ...directed,
    ...(convene
      ? {
          council: councilDialogue(input, turn),
          actions: [],
          text:
            (meeting
              ? "**MEETING SUMMARY**\n\nParticipants: 4 · Decisions made: 0 · Follow-up meetings required: 17\n\n"
              : "") +
            "**Unanimous decision: Further deliberation required.**\n\nFour minds entered. The question is still here. Management has declared this a team-building exercise.",
        }
      : {}),
  };
}

export function newlyUnlocked(
  metrics: PerformanceMetrics,
  previous: string[],
): string[] {
  return achievements
    .filter(
      (a) =>
        !previous.includes(a.id) &&
        (a.id === "council"
          ? metrics.council
          : a.id === "coding"
            ? metrics.coding
            : metrics.avoided) >= a.threshold,
    )
    .map((a) => a.id);
}
