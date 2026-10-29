import type { ComedyAction } from "./comedy";
export type Intent =
  | "coding"
  | "math"
  | "writing"
  | "research"
  | "advice"
  | "productivity"
  | "greeting"
  | "urgent"
  | "self"
  | "general"
  | "sensitive";
export interface AgentResponse {
  agent: number;
  text: string;
}
export interface ComedyMetadata {
  memeKey?: string;
  actions?: ComedyAction[];
  usedActions?: string[];
  jokeId?: string;
  comedySubject?: string;
  strategy?: string;
  setup?: string;
}
export interface ChatMessage extends ComedyMetadata {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  stages?: string[];
  council?: AgentResponse[];
  intent?: Intent;
  status?: string;
}
export interface Conversation {
  id: string;
  title: string;
  kind: "chat" | "council" | "meeting";
  messages: ChatMessage[];
  created: number;
}
export interface PerformanceMetrics {
  received: number;
  avoided: number;
  milliseconds: number;
  council: number;
  coding: number;
  history: { at: number; avoided: number }[];
}
export interface AppSettings {
  language: "en" | "ml";
  reducedMotion: boolean;
  chaos: boolean;
}
export interface AppState {
  version: 1;
  conversations: Conversation[];
  metrics: PerformanceMetrics;
  settings: AppSettings;
  unlocked: string[];
  sessionTasks: number;
  insistence: number;
}
export interface Workflow extends ComedyMetadata {
  intent: Intent;
  acknowledgement: string;
  stages: string[];
  text: string;
  council?: AgentResponse[];
  status: string;
}
