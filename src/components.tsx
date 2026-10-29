import { chatMemes } from "./media";
import { validAction, actionRegistry } from "./comedy";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  Copy,
  CornerDownLeft,
  FileCode2,
  Hash,
  Sparkles,
  Sprout,
  Timer,
  Users,
  Zap,
  ShieldCheck,
  SkipForward,
  CircleCheck,
  LoaderCircle,
} from "lucide-react";
import { agents } from "./engine";
import type { ChatMessage, Workflow } from "./types";

export function BrandMark({ small = false }: { small?: boolean }) {
  return (
    <span className={`brand-mark ${small ? "small" : ""}`} aria-hidden="true">
      <span />
      <span />
    </span>
  );
}
export function RichText({ text }: { text: string }) {
  return (
    <div className="rich-text">
      {text.split("\n").map((line, i) => (
        <p key={i} className={!line ? "space" : ""}>
          {line
            .split(/(\*\*.*?\*\*)/g)
            .map((part, j) =>
              part.startsWith("**") ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              ),
            )}
        </p>
      ))}
    </div>
  );
}
export const suggestions = [
  {
    icon: FileCode2,
    label: "Build something. Or don’t.",
    prompt: "Write a Python program",
    category: "CODING",
  },
  {
    icon: Hash,
    label: "Surely I can manage this.",
    prompt: "Calculate 2 + 2",
    category: "TINY MATHS",
  },
  {
    icon: Zap,
    label: "Tomorrow’s problem, probably.",
    prompt: "Help me become productive",
    category: "COLLEGE LIFE",
  },
  {
    icon: Sprout,
    label: "Let’s overthink the basics.",
    prompt: "Should I drink water?",
    category: "LIFE DECISIONS",
  },
];
export function Welcome({
  onSubmit,
  onThinknt,
}: {
  onSubmit: (s: string) => void;
  onThinknt: () => void;
}) {
  return (
    <div className="welcome">
      <div className="eyebrow welcome-eyebrow">
        <span className="status-dot" /> THE WORLD’S MOST USELESS CHATBOT
      </div>
      <BrandMark />
      <h1>
        Ask anything.
        <br />
        <em>Regret everything.</em>
      </h1>
      <p className="welcome-sub">One lazy chatbot. Absolutely no ambition.</p>
      <div className="suggestions">
        {suggestions.map(({ icon: Icon, ...s }) => (
          <button key={s.category} onClick={() => onSubmit(s.prompt)}>
            <div className="suggestion-top">
              <Icon size={19} />
              <ArrowUpRight size={15} />
            </div>
            <span className="eyebrow">{s.category}</span>
            <strong>{s.prompt}</strong>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
      <button className="thinknt-home-card" onClick={onThinknt}>
        <Brain size={22} />
        <span>
          <strong>Let me guess who’s in your mind.</strong>
          <small>askinatot · The world’s worst mind reader</small>
        </span>
        <ArrowUpRight size={17} />
      </button>
      <div className="welcome-note">
        <ShieldCheck size={14} /> No API key. No pressure. No ambition.
      </div>
    </div>
  );
}
export function AgentCards({
  responses = [],
  visible = 4,
}: {
  responses?: NonNullable<ChatMessage["council"]>;
  visible?: number;
}) {
  return (
    <div className="agent-grid">
      {agents.map((a, i) => (
        <article
          key={a.name}
          className={`agent-card ${i < visible && responses[i] ? "has-spoken" : ""}`}
        >
          <div className="agent-heading">
            <div className={`avatar ${a.color}`}>{a.initials}</div>
            <div>
              <h3>{a.name}</h3>
              <span>{a.role}</span>
            </div>
            <span
              className={`agent-light ${responses[i] && i === visible - 1 ? "speaking" : ""}`}
            />
          </div>
          {responses[i] && i < visible ? (
            <p className="agent-words">{responses[i].text}</p>
          ) : (
            <div className="agent-wait">
              <span className="status-dot" />
              {a.status}
            </div>
          )}
          <div className="agent-footer">
            FICTIONAL AGENT <span>0{i + 1}</span>
          </div>
        </article>
      ))}
    </div>
  );
}
export function CouncilWelcome({ meeting }: { meeting: boolean }) {
  return (
    <div className="council-welcome">
      <div className="section-kicker">
        <Users size={16} /> FOUR MINDS. ZERO DELIVERABLES.
      </div>
      <h1>
        {meeting
          ? "This could have been\nanother meeting."
          : "The Council of\nUnnecessary Intelligence."}
      </h1>
      <p>
        Extraordinary minds. Extensive discussion. Absolutely no conclusion.
      </p>
      <AgentCards />
      <div className="council-summary">
        <span>
          <strong>4</strong> fictional specialists
        </span>
        <span>
          <strong>0</strong> decisions made
        </span>
        <span>
          <strong>100%</strong> executive satisfaction
        </span>
      </div>
      <div className="muted-note">
        Scripted Demo Engine · Simulated agents, with entirely real commitment
        to doing nothing.
      </div>
    </div>
  );
}
export function Message({
  message,
  notify,
  onAction,
  busy,
  simple = false,
}: {
  message: ChatMessage;
  notify: (s: string) => void;
  onAction: (messageId: string, id: string) => void;
  busy: boolean;
  simple?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        message.text +
          (message.council
            ? "\n\n" +
              message.council
                .map((r) => `${agents[r.agent].name}: ${r.text}`)
                .join("\n\n")
            : ""),
      );
      setCopied(true);
    } catch {
      notify("Clipboard unavailable. You can select and copy the message.");
    }
  }
  if (message.role === "user")
    return (
      <div className="user-message">
        <div>{message.text}</div>
        <span>
          YOU ·{" "}
          {new Date(message.at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    );
  return (
    <article className="assistant-message">
      <div className="message-heading">
        <BrandMark small />
        <strong>askinatot</strong>
        {!simple && <span className="model-tag">DEMO ENGINE</span>}
        <span className="message-time">
          {new Date(message.at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {!simple && !!message.stages?.length && (
        <div className="completed-workflow">
          <button
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <CircleCheck size={14} /> Fictional workflow complete{" "}
            <span>{message.stages.length} stages</span>
            <ChevronRight size={14} className={expanded ? "rotate" : ""} />
          </button>
          {expanded && (
            <ol>
              {message.stages.map((s) => (
                <li key={s}>
                  <Check size={12} />
                  {s}
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
      {!simple && message.council && <AgentCards responses={message.council} />}
      <RichText text={message.text} />
      {simple && message.intent !== "sensitive" && chatMemes[message.memeKey ?? Object.keys(chatMemes)[Math.floor(message.at) % Object.keys(chatMemes).length]] && <img className="reply-meme" src={chatMemes[message.memeKey ?? Object.keys(chatMemes)[Math.floor(message.at) % Object.keys(chatMemes).length]]} alt="A meme to go with this reply" onError={e=>{e.currentTarget.hidden=true;}}/>}
      <div className="comedy-actions">
        {Array.isArray(message.actions) &&
          message.actions
            .filter((a) => a && validAction(a.id))
            .map((a) => (
              <button
                className="secondary-button"
                key={a.id}
                disabled={busy || message.usedActions?.includes(a.id)}
                onClick={() => onAction(message.id, a.id)}
              >
                {actionRegistry[a.id].label}
                {message.usedActions?.includes(a.id) ? " · Used" : " ↗"}
              </button>
            ))}
      </div>
      <div className="message-actions">
        {!simple && (
          <span
            className={`result-chip ${message.intent === "sensitive" ? "safety" : ""}`}
          >
            <Check size={12} />
            {message.status}
          </span>
        )}
        <button aria-label="Copy response" title="Copy response" onClick={copy}>
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </article>
  );
}
export function Processing({
  workflow,
  step,
  skip,
}: {
  workflow: Workflow;
  step: number;
  skip: () => void;
}) {
  const stagesDone = Math.min(step, workflow.stages.length);
  const total = workflow.stages.length + (workflow.council?.length || 0);
  return (
    <div className="processing" role="status" aria-live="polite">
      <div className="message-heading">
        <BrandMark small />
        <strong>askinatot</strong>
        <span className="model-tag">SIMULATED WORKFLOW</span>
      </div>
      <p>{workflow.acknowledgement}</p>
      <div className="workflow-box">
        <div className="workflow-label">
          <span>
            <LoaderCircle size={14} className="spin" /> Conducting excessive
            analysis
          </span>
          <button onClick={skip}>
            <SkipForward size={13} /> Skip
          </button>
        </div>
        <div className="workflow-track">
          <span style={{ width: `${(step / Math.max(1, total)) * 100}%` }} />
        </div>
        <div className="workflow-stages">
          {workflow.stages.map((s, i) => (
            <div
              key={s}
              className={
                i < stagesDone ? "done" : i === stagesDone ? "current" : ""
              }
            >
              {i < stagesDone ? (
                <Check size={13} />
              ) : i === stagesDone ? (
                <LoaderCircle size={13} className="spin" />
              ) : (
                <span className="stage-dot" />
              )}
              {s}
            </div>
          ))}
        </div>
        <small>
          Fictional corporate process · {stagesDone}/{workflow.stages.length}{" "}
          stages
        </small>
      </div>
      {workflow.council && step >= workflow.stages.length && (
        <AgentCards
          responses={workflow.council}
          visible={step - workflow.stages.length}
        />
      )}
    </div>
  );
}
export function Composer({
  onSubmit,
  busy,
  kind,
}: {
  onSubmit: (text: string) => void;
  busy: boolean;
  kind: string;
}) {
  const [value, setValue] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    if (!busy) ref.current?.focus({ preventScroll: true });
  }, [busy, kind]);
  function send() {
    if (!value.trim() || busy) return;
    onSubmit(value.trim());
    setValue("");
  }
  return (
    <div className="composer-region">
      <div className="composer">
        <textarea
          ref={ref}
          value={value}
          maxLength={6000}
          rows={2}
          placeholder={
            kind === "chat"
              ? "Ask me something. Keep expectations low..."
              : kind === "meeting"
                ? "What should this meeting fail to resolve?"
                : "Give the council something to overthink..."
          }
          aria-label="Your task"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              send();
            }
          }}
        />
        <div className="composer-bottom">
          <span>
            <span className="status-dot" /> askinatot 3.0{" "}
            <span className="composer-divider">/</span> Demo Engine
          </span>
          <div>
            <span className="keyboard-hint">
              Shift <CornerDownLeft size={11} /> for a new line
            </span>
            <button
              className="send-button"
              title="Send task"
              aria-label="Send task"
              disabled={busy || !value.trim()}
              onClick={send}
            >
              <ArrowUp size={19} />
            </button>
          </div>
        </div>
      </div>
      <div className="composer-disclaimer">
        askinatot can make mistakes. Especially intentionally.{" "}
        <span>Local demo · No API key required</span>
      </div>
    </div>
  );
}
export function Toast({ text, close }: { text: string; close: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(close, 4500);
    return () => clearTimeout(t);
  }, [text, close]);
  return (
    <div className="toast" role="status">
      <Sparkles size={18} />
      <span>{text}</span>
      <button onClick={close} aria-label="Dismiss notification">
        ×
      </button>
    </div>
  );
}
